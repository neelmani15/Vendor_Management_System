import {
  VendorForRecommendation,
  WorkRequirementForRecommendation,
  VendorDocumentForRecommendation,
} from './types';
import { VendorStatus, OnboardingStatus, DocumentStatus } from '../../../common/constants/enums';

export interface FilterResult {
  eligible: boolean;
  disqualificationReasons: string[];
}

export function evaluateHardFilters(
  vendor: VendorForRecommendation,
  requirement: WorkRequirementForRecommendation,
  documents: VendorDocumentForRecommendation[],
  referenceDate = new Date()
): FilterResult {
  const reasons: string[] = [];

  // 1. Vendor Status Check
  if (vendor.status !== VendorStatus.ACTIVE) {
    reasons.push(`Vendor status is ${vendor.status} (must be ACTIVE)`);
  }
  if (vendor.onboardingStatus !== OnboardingStatus.VERIFIED) {
    reasons.push(`Vendor onboarding status is ${vendor.onboardingStatus} (must be VERIFIED)`);
  }

  // 2. Category Match Check
  const hasCategory = vendor.categories.some(
    (c) => c.trim().toLowerCase() === requirement.category.trim().toLowerCase()
  );
  if (!hasCategory) {
    reasons.push(`Vendor does not support required category '${requirement.category}'`);
  }

  // 3. Minimum Rating Check
  if (vendor.rating < requirement.minimumRating) {
    reasons.push(
      `Vendor rating (${vendor.rating.toFixed(1)}) is below minimum required rating (${requirement.minimumRating.toFixed(1)})`
    );
  }

  // 4. Location Match Check
  // Vendor must operate in the required state or country at minimum
  const reqLoc = requirement.location;
  const servesLocation = vendor.operatingLocations.some((loc) => {
    const sameCountry = loc.country.trim().toLowerCase() === reqLoc.country.trim().toLowerCase();
    const sameState = loc.state.trim().toLowerCase() === reqLoc.state.trim().toLowerCase();
    return sameCountry && (sameState || loc.country.trim().toLowerCase() === 'global');
  });

  if (!servesLocation) {
    reasons.push(
      `Vendor does not operate in requirement region (${reqLoc.city ? reqLoc.city + ', ' : ''}${reqLoc.state}, ${reqLoc.country})`
    );
  }

  // 5. Mandatory Compliance Documents Check
  if (requirement.complianceRequirements && requirement.complianceRequirements.length > 0) {
    for (const reqDocType of requirement.complianceRequirements) {
      const doc = documents.find((d) => d.documentType === reqDocType);

      if (!doc) {
        reasons.push(`Mandatory compliance document missing: ${reqDocType}`);
        continue;
      }

      const expiry = new Date(doc.expiresAt);
      const isExpiredByDate = expiry < referenceDate;
      const isExpiredByStatus = doc.status === DocumentStatus.EXPIRED;
      const isRejected = doc.status === DocumentStatus.REJECTED;

      if (isExpiredByDate || isExpiredByStatus) {
        reasons.push(`Required compliance document '${reqDocType}' is expired (expired on ${expiry.toISOString().split('T')[0]})`);
      } else if (isRejected) {
        reasons.push(`Required compliance document '${reqDocType}' was rejected during verification`);
      } else if (doc.status !== DocumentStatus.VALID && doc.status !== DocumentStatus.EXPIRING_SOON) {
        reasons.push(`Required compliance document '${reqDocType}' is pending verification`);
      }
    }
  }

  return {
    eligible: reasons.length === 0,
    disqualificationReasons: reasons,
  };
}
