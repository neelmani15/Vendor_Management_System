import {
  VendorForRecommendation,
  WorkRequirementForRecommendation,
  VendorDocumentForRecommendation,
  EvaluatedVendorCandidate,
} from './types';
import { evaluateHardFilters } from './filters';
import { calculateNormalizedScores, computeWeightedTotalScore } from './scorer';
import { compareCandidatesDeterministically } from './tie-breaker';
import { generateRecommendationExplanation } from './explainer';

export * from './types';
export * from './filters';
export * from './scorer';
export * from './tie-breaker';
export * from './explainer';

export interface SingleVendorEvaluationInput {
  vendor: VendorForRecommendation;
  requirement: WorkRequirementForRecommendation;
  documents: VendorDocumentForRecommendation[];
  referenceDate?: Date;
}

/**
 * Pure function evaluating an individual vendor against a work requirement.
 */
export function calculateVendorRecommendation(
  input: SingleVendorEvaluationInput
): EvaluatedVendorCandidate {
  const referenceDate = input.referenceDate || new Date();
  const filterResult = evaluateHardFilters(
    input.vendor,
    input.requirement,
    input.documents,
    referenceDate
  );

  const breakdown = calculateNormalizedScores(
    input.vendor,
    input.requirement,
    input.documents,
    referenceDate
  );

  const score = filterResult.eligible ? computeWeightedTotalScore(breakdown) : 0;

  const explanation = generateRecommendationExplanation(
    input.vendor,
    input.requirement,
    input.documents,
    breakdown,
    filterResult.eligible,
    filterResult.disqualificationReasons
  );

  return {
    vendorId: input.vendor._id,
    vendorName: input.vendor.name,
    eligible: filterResult.eligible,
    disqualificationReasons: filterResult.disqualificationReasons,
    score,
    scoreBreakdown: breakdown,
    explanation,
    vendor: input.vendor,
  };
}

/**
 * Pure function evaluating and ranking a list of vendors against a work requirement.
 * Applies deterministic tie-breaking and assigns ranks.
 */
export function rankCandidateVendors(
  vendors: VendorForRecommendation[],
  requirement: WorkRequirementForRecommendation,
  documentMap: Record<string, VendorDocumentForRecommendation[]>,
  referenceDate = new Date()
) {
  const evaluated = vendors.map((vendor) =>
    calculateVendorRecommendation({
      vendor,
      requirement,
      documents: documentMap[vendor._id] || [],
      referenceDate,
    })
  );

  // Deterministic sort
  evaluated.sort(compareCandidatesDeterministically);

  // Assign ranks
  return evaluated.map((item, index) => ({
    vendorId: item.vendorId,
    vendorName: item.vendorName,
    rank: index + 1,
    score: item.score,
    eligibility: item.eligible ? ('ELIGIBLE' as const) : ('DISQUALIFIED' as const),
    disqualificationReasons: item.disqualificationReasons,
    explanation: item.explanation,
  }));
}
