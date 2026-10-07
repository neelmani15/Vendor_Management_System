import {
  VendorForRecommendation,
  WorkRequirementForRecommendation,
  VendorDocumentForRecommendation,
} from './types';
import { IScoreBreakdown, IRecommendationExplanation } from '../recommendation-run.model';

export function generateRecommendationExplanation(
  vendor: VendorForRecommendation,
  requirement: WorkRequirementForRecommendation,
  documents: VendorDocumentForRecommendation[],
  breakdown: IScoreBreakdown,
  eligible: boolean,
  disqualificationReasons: string[]
): IRecommendationExplanation {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (!eligible) {
    return {
      summary: `Disqualified from recommendation (${disqualificationReasons[0] || 'Mandatory criteria unmet'})`,
      strengths: [],
      weaknesses: disqualificationReasons,
      scoreBreakdown: breakdown,
    };
  }

  // Category insights
  if (breakdown.category === 100) {
    strengths.push(`Exact primary category match for ${requirement.category}`);
  }

  // Location insights
  if (breakdown.location === 100) {
    strengths.push(`Local physical presence in ${requirement.location.city}, ${requirement.location.state}`);
  } else if (breakdown.location === 80) {
    strengths.push(`State-level operational coverage across ${requirement.location.state}`);
    weaknesses.push(`No dedicated local base in ${requirement.location.city} (state coverage only)`);
  } else if (breakdown.location === 50) {
    weaknesses.push(`Regional distance: Operates nationally but outside ${requirement.location.state}`);
  }

  // Rating insights
  if (vendor.rating >= 4.5) {
    strengths.push(`Exceptional vendor rating (${vendor.rating.toFixed(1)}/5.0)`);
  } else if (vendor.rating >= 4.0) {
    strengths.push(`Solid client rating (${vendor.rating.toFixed(1)}/5.0)`);
  } else if (vendor.rating < 3.5) {
    weaknesses.push(`Sub-optimal vendor rating (${vendor.rating.toFixed(1)}/5.0)`);
  }

  // Capability insights
  if (requirement.requiredCapabilities && requirement.requiredCapabilities.length > 0) {
    const vendorCaps = vendor.capabilities.map((c) => c.toLowerCase());
    const missingCaps = requirement.requiredCapabilities.filter(
      (rc) => !vendorCaps.includes(rc.toLowerCase())
    );

    if (missingCaps.length === 0) {
      strengths.push(`100% capability match covering all ${requirement.requiredCapabilities.length} required skill sets`);
    } else {
      weaknesses.push(`Missing capabilities: ${missingCaps.join(', ')}`);
    }
  }

  // Compliance insights
  if (breakdown.compliance === 100) {
    strengths.push('All required compliance documents are verified and fully active');
  } else if (breakdown.compliance < 100) {
    weaknesses.push('Compliance documents have upcoming renewals or partial coverage');
  }

  // Experience insights
  if (vendor.completedProjects >= 30) {
    strengths.push(`Demonstrated enterprise track record with ${vendor.completedProjects} delivered projects`);
  } else if (vendor.completedProjects < 5) {
    weaknesses.push(`Limited project portfolio (${vendor.completedProjects} verified projects)`);
  }

  // Executive summary synthesis
  let summary = 'Strong match for this requirement';
  const totalScore =
    breakdown.category * 0.3 +
    breakdown.location * 0.2 +
    breakdown.rating * 0.15 +
    breakdown.capability * 0.15 +
    breakdown.compliance * 0.1 +
    breakdown.experience * 0.05 +
    breakdown.availability * 0.05;

  if (totalScore >= 90) {
    summary = 'Outstanding top-tier candidate with excellent technical, regional, and compliance alignment';
  } else if (totalScore >= 75) {
    summary = 'Strong qualified candidate with dependable capabilities and verified track record';
  } else if (totalScore >= 60) {
    summary = 'Moderate candidate match with some capability or geographic tradeoffs';
  } else {
    summary = 'Candidate meets minimum criteria but has notable suitability gaps';
  }

  return {
    summary,
    strengths,
    weaknesses,
    scoreBreakdown: breakdown,
  };
}
