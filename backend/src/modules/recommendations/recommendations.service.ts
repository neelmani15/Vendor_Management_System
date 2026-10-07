import { Types } from 'mongoose';
import { WorkRequirementModel } from '../work-requirements/work-requirement.model';
import { VendorModel } from '../vendors/vendor.model';
import { VendorDocumentModel } from '../vendor-documents/vendor-document.model';
import { RecommendationRunModel } from './recommendation-run.model';
import { rankCandidateVendors } from './engine';
import {
  VendorForRecommendation,
  WorkRequirementForRecommendation,
  VendorDocumentForRecommendation,
} from './engine/types';
import { NotFoundError } from '../../common/errors';
import { ALGORITHM_VERSIONS } from '../../common/constants/algorithm';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../common/constants/enums';
import { AuthenticatedUser } from '../../common/types';
import { AIService } from '../ai/ai.service';
import { RecommendationSummaryInput } from '../ai/ai.interface';

export interface GetRecommendationsOptions {
  limit?: number;
  offset?: number;
  minimumScore?: number;
  includeBreakdown?: boolean;
  generateSummary?: boolean;
}

export class RecommendationsService {
  /**
   * Generates deterministic recommendations for a work requirement.
   * Performs candidate pre-filtering, batch document retrieval (preventing N+1),
   * applies pure-function scoring, persists the run, and optionally generates an AI summary.
   */
  public static async generateRecommendations(
    workRequirementId: string,
    options: GetRecommendationsOptions = {},
    actor?: AuthenticatedUser
  ) {
    const requirement = await WorkRequirementModel.findById(workRequirementId).lean();
    if (!requirement) {
      throw new NotFoundError(`Work requirement with ID ${workRequirementId} not found`);
    }

    // Step 1: Candidate reduction at database layer
    // Query active candidates with matching category
    const candidateVendors = await VendorModel.find({
      categories: requirement.category,
    }).lean();

    // Step 2: Batch fetch all documents for all candidate vendors (prevents N+1)
    const candidateIds = candidateVendors.map((v) => v._id);
    const candidateDocs = await VendorDocumentModel.find({
      vendorId: { $in: candidateIds },
    }).lean();

    // Index documents by vendorId
    const documentMap: Record<string, VendorDocumentForRecommendation[]> = {};
    for (const doc of candidateDocs) {
      const vId = doc.vendorId.toString();
      if (!documentMap[vId]) {
        documentMap[vId] = [];
      }
      documentMap[vId].push({
        _id: doc._id.toString(),
        vendorId: vId,
        documentType: doc.documentType as any,
        status: doc.status as any,
        expiresAt: doc.expiresAt,
      });
    }

    // Step 3: Transform MongoDB objects to pure function inputs
    const mappedVendors: VendorForRecommendation[] = candidateVendors.map((v) => ({
      _id: v._id.toString(),
      name: v.name,
      vendorType: v.vendorType as any,
      categories: v.categories,
      operatingLocations: v.operatingLocations,
      rating: v.rating,
      status: v.status as any,
      onboardingStatus: v.onboardingStatus as any,
      yearsOfExperience: v.yearsOfExperience,
      completedProjects: v.completedProjects,
      capabilities: v.capabilities,
      complianceStatus: v.complianceStatus,
    }));

    const mappedRequirement: WorkRequirementForRecommendation = {
      _id: requirement._id.toString(),
      title: requirement.title,
      category: requirement.category,
      location: requirement.location,
      minimumRating: requirement.minimumRating,
      requiredCapabilities: requirement.requiredCapabilities,
      preferredVendorTypes: requirement.preferredVendorTypes as any,
      complianceRequirements: requirement.complianceRequirements as any,
    };

    // Step 4: Run pure deterministic scoring and ranking
    const allRanked = rankCandidateVendors(mappedVendors, mappedRequirement, documentMap);

    // Filter by minimum score if specified
    let filteredResults = allRanked;
    if (options.minimumScore !== undefined && options.minimumScore > 0) {
      filteredResults = allRanked.filter(
        (r) => r.eligibility === 'ELIGIBLE' && r.score >= options.minimumScore!
      );
    }

    // Step 5: Persist run snapshot
    const run = await RecommendationRunModel.create({
      workRequirementId: requirement._id,
      algorithmVersion: ALGORITHM_VERSIONS.V1,
      generatedAt: new Date(),
      generatedBy: actor ? new Types.ObjectId(actor.id) : undefined,
      candidatesEvaluated: mappedVendors.length,
      recommendations: allRanked.map((item) => ({
        vendorId: new Types.ObjectId(item.vendorId),
        vendorName: item.vendorName,
        rank: item.rank,
        score: item.score,
        eligibility: item.eligibility,
        disqualificationReasons: item.disqualificationReasons,
        explanation: item.explanation,
      })),
    });

    await AuditService.log({
      actorId: actor?.id,
      actorEmail: actor?.email,
      action: AuditAction.RECOMMENDATION_GENERATED,
      entityType: 'RecommendationRun',
      entityId: run._id.toString(),
      metadata: {
        workRequirementId,
        algorithmVersion: ALGORITHM_VERSIONS.V1,
        totalEvaluated: mappedVendors.length,
      },
    });

    // Step 6: Generate AI / Fallback summary
    let aiSummaryData = null;
    if (options.generateSummary !== false) {
      const summaryInput: RecommendationSummaryInput = {
        workRequirement: {
          id: requirement._id.toString(),
          title: requirement.title,
          category: requirement.category,
          location: `${requirement.location.city ? requirement.location.city + ', ' : ''}${requirement.location.state}, ${requirement.location.country}`,
          estimatedValue: requirement.estimatedValue,
          currency: requirement.currency,
        },
        totalCandidates: mappedVendors.length,
        rankedRecommendations: allRanked.map((r) => ({
          vendorName: r.vendorName,
          rank: r.rank,
          score: r.score,
          eligibility: r.eligibility,
          disqualificationReasons: r.disqualificationReasons,
          strengths: r.explanation.strengths,
          weaknesses: r.explanation.weaknesses,
          scoreBreakdown: r.explanation.scoreBreakdown,
        })),
      };

      aiSummaryData = await AIService.generateSummary(
        summaryInput,
        run._id.toString(),
        actor
      );
    }

    // Step 7: Apply pagination slicing for output
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    const pagedResults = filteredResults.slice(offset, offset + limit);

    // Optionally strip score breakdown if includeBreakdown === false
    const finalData = options.includeBreakdown === false
      ? pagedResults.map((r) => {
          const { explanation, ...rest } = r;
          const { scoreBreakdown, ...expRest } = explanation;
          return { ...rest, explanation: expRest };
        })
      : pagedResults;

    return {
      runId: run._id.toString(),
      algorithmVersion: ALGORITHM_VERSIONS.V1,
      totalCandidates: mappedVendors.length,
      total: filteredResults.length,
      limit,
      offset,
      recommendations: finalData,
      aiSummary: aiSummaryData,
    };
  }

  public static async getHistoricalRuns(workRequirementId: string) {
    return RecommendationRunModel.find({
      workRequirementId: new Types.ObjectId(workRequirementId),
    })
      .sort({ generatedAt: -1 })
      .lean();
  }
}
