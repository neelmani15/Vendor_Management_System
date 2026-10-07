import {
  VendorForRecommendation,
  WorkRequirementForRecommendation,
  VendorDocumentForRecommendation,
} from './types';
import { IScoreBreakdown } from '../recommendation-run.model';
import { SCORING_WEIGHTS_V1 } from '../../../common/constants/algorithm';
import { DocumentStatus } from '../../../common/constants/enums';

export function calculateNormalizedScores(
  vendor: VendorForRecommendation,
  requirement: WorkRequirementForRecommendation,
  documents: VendorDocumentForRecommendation[],
  referenceDate = new Date()
): IScoreBreakdown {
  // 1. Category Score (0 - 100)
  const isExactCategory = vendor.categories.some(
    (c) => c.trim().toLowerCase() === requirement.category.trim().toLowerCase()
  );
  const categoryScore = isExactCategory ? 100 : 0;

  // 2. Location Score (0 - 100)
  let locationScore = 0;
  const reqLoc = requirement.location;

  for (const loc of vendor.operatingLocations) {
    const sameCountry = loc.country.trim().toLowerCase() === reqLoc.country.trim().toLowerCase();
    const sameState = loc.state.trim().toLowerCase() === reqLoc.state.trim().toLowerCase();
    const sameCity =
      loc.city && reqLoc.city
        ? loc.city.trim().toLowerCase() === reqLoc.city.trim().toLowerCase()
        : false;

    if (sameCity && sameState && sameCountry) {
      locationScore = Math.max(locationScore, 100);
    } else if (sameState && sameCountry) {
      locationScore = Math.max(locationScore, 80);
    } else if (sameCountry) {
      locationScore = Math.max(locationScore, 50);
    }
  }

  // 3. Rating Score (0 - 100)
  const clampedRating = Math.max(0, Math.min(5, vendor.rating));
  const ratingScore = Math.round((clampedRating / 5.0) * 100);

  // 4. Capability Match Score (0 - 100)
  let capabilityScore = 100;
  if (requirement.requiredCapabilities && requirement.requiredCapabilities.length > 0) {
    const vendorCaps = vendor.capabilities.map((c) => c.trim().toLowerCase());
    const matchedCount = requirement.requiredCapabilities.filter((rc) =>
      vendorCaps.includes(rc.trim().toLowerCase())
    ).length;
    capabilityScore = Math.round((matchedCount / requirement.requiredCapabilities.length) * 100);
  }

  // 5. Compliance Score (0 - 100)
  let complianceScore = 100;
  if (requirement.complianceRequirements && requirement.complianceRequirements.length > 0) {
    let validCount = 0;
    for (const reqDocType of requirement.complianceRequirements) {
      const doc = documents.find((d) => d.documentType === reqDocType);
      if (doc) {
        const isExpired = new Date(doc.expiresAt) < referenceDate || doc.status === DocumentStatus.EXPIRED;
        if (!isExpired && (doc.status === DocumentStatus.VALID || doc.status === DocumentStatus.EXPIRING_SOON)) {
          validCount++;
        }
      }
    }
    complianceScore = Math.round((validCount / requirement.complianceRequirements.length) * 100);
  }

  // Deduct slightly if any document is expiring soon
  const hasExpiringSoon = documents.some(
    (d) => d.status === DocumentStatus.EXPIRING_SOON
  );
  if (hasExpiringSoon && complianceScore > 10) {
    complianceScore = Math.max(0, complianceScore - 10);
  }

  // 6. Experience Score (0 - 100)
  // 50 points from completed projects (capped at 50 projects) + 50 points from years of experience (capped at 10 years)
  const projectPoints = Math.min(50, (vendor.completedProjects / 50) * 50);
  const yearsPoints = Math.min(50, (vendor.yearsOfExperience / 10) * 50);
  const experienceScore = Math.round(projectPoints + yearsPoints);

  // 7. Availability Score (0 - 100)
  // Active and verified vendors get 90-100 baseline
  const availabilityScore = vendor.status === 'ACTIVE' ? 95 : 0;

  return {
    category: categoryScore,
    location: locationScore,
    rating: ratingScore,
    capability: capabilityScore,
    compliance: complianceScore,
    experience: experienceScore,
    availability: availabilityScore,
  };
}

export function computeWeightedTotalScore(breakdown: IScoreBreakdown): number {
  const weights = SCORING_WEIGHTS_V1;

  const total =
    breakdown.category * weights.category +
    breakdown.location * weights.location +
    breakdown.rating * weights.rating +
    breakdown.capability * weights.capability +
    breakdown.compliance * weights.compliance +
    breakdown.experience * weights.experience +
    breakdown.availability * weights.availability;

  return Math.round(total * 100) / 100;
}
