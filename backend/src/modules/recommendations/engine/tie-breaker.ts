import { EvaluatedVendorCandidate } from './types';

/**
 * Deterministic Tie-Breaking Comparator (Section 29):
 * 1. Higher final score
 * 2. Higher rating
 * 3. Higher compliance score
 * 4. More completed projects
 * 5. Vendor name ascending (case-insensitive alphabetical)
 * 6. Vendor ID ascending (lexicographical string comparison)
 */
export function compareCandidatesDeterministically(
  a: EvaluatedVendorCandidate,
  b: EvaluatedVendorCandidate
): number {
  // Disqualified vendors always rank below eligible vendors
  if (a.eligible && !b.eligible) return -1;
  if (!a.eligible && b.eligible) return 1;

  // 1. Higher final score (difference greater than 0.001)
  const scoreDiff = b.score - a.score;
  if (Math.abs(scoreDiff) > 0.001) {
    return scoreDiff;
  }

  // 2. Higher rating
  const ratingDiff = b.vendor.rating - a.vendor.rating;
  if (Math.abs(ratingDiff) > 0.001) {
    return ratingDiff;
  }

  // 3. Higher compliance score
  const complianceDiff = b.scoreBreakdown.compliance - a.scoreBreakdown.compliance;
  if (Math.abs(complianceDiff) > 0.001) {
    return complianceDiff;
  }

  // 4. More completed projects
  const projectsDiff = b.vendor.completedProjects - a.vendor.completedProjects;
  if (projectsDiff !== 0) {
    return projectsDiff;
  }

  // 5. Vendor name ascending
  const nameComparison = a.vendorName.localeCompare(b.vendorName);
  if (nameComparison !== 0) {
    return nameComparison;
  }

  // 6. Vendor ID ascending (guaranteed unique tie-breaker)
  return a.vendorId.localeCompare(b.vendorId);
}
