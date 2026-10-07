import { describe, it, expect } from 'vitest';
import {
  calculateVendorRecommendation,
  rankCandidateVendors,
  evaluateHardFilters,
  calculateNormalizedScores,
  computeWeightedTotalScore,
  compareCandidatesDeterministically,
} from '../../src/modules/recommendations/engine';
import {
  VendorForRecommendation,
  WorkRequirementForRecommendation,
  VendorDocumentForRecommendation,
} from '../../src/modules/recommendations/engine/types';
import {
  VendorType,
  VendorStatus,
  OnboardingStatus,
  DocumentType,
  DocumentStatus,
} from '../../src/common/constants/enums';

describe('Recommendation Engine (Pure Function Tests)', () => {
  const mockRequirement: WorkRequirementForRecommendation = {
    _id: 'req-001',
    title: 'High-Voltage Switchgear Installation',
    category: 'Electrical Engineering',
    location: { country: 'USA', state: 'TX', city: 'Austin' },
    minimumRating: 4.0,
    requiredCapabilities: ['High Voltage Wiring', 'Switchgear Installation', 'Industrial Safety'],
    preferredVendorTypes: [VendorType.COMPANY],
    complianceRequirements: [DocumentType.INSURANCE, DocumentType.SAFETY_CERTIFICATE],
  };

  const mockValidDocs: VendorDocumentForRecommendation[] = [
    {
      _id: 'doc-1',
      vendorId: 'v-001',
      documentType: DocumentType.INSURANCE,
      status: DocumentStatus.VALID,
      expiresAt: new Date('2027-01-01'),
    },
    {
      _id: 'doc-2',
      vendorId: 'v-001',
      documentType: DocumentType.SAFETY_CERTIFICATE,
      status: DocumentStatus.VALID,
      expiresAt: new Date('2027-01-01'),
    },
  ];

  const baseVendor: VendorForRecommendation = {
    _id: 'v-001',
    name: 'Apex Electrical Systems',
    vendorType: VendorType.COMPANY,
    categories: ['Electrical Engineering'],
    operatingLocations: [{ country: 'USA', state: 'TX', city: 'Austin' }],
    rating: 4.8,
    status: VendorStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.VERIFIED,
    yearsOfExperience: 10,
    completedProjects: 40,
    capabilities: ['High Voltage Wiring', 'Switchgear Installation', 'Industrial Safety'],
    complianceStatus: 'COMPLIANT',
  };

  describe('1. Hard Filters & Disqualifications', () => {
    it('should qualify a fully compliant vendor', () => {
      const result = evaluateHardFilters(baseVendor, mockRequirement, mockValidDocs);
      expect(result.eligible).toBe(true);
      expect(result.disqualificationReasons).toHaveLength(0);
    });

    it('should disqualify an INACTIVE vendor', () => {
      const vendor = { ...baseVendor, status: VendorStatus.INACTIVE };
      const result = evaluateHardFilters(vendor, mockRequirement, mockValidDocs);
      expect(result.eligible).toBe(false);
      expect(result.disqualificationReasons[0]).toContain('INACTIVE');
    });

    it('should disqualify a BLACKLISTED vendor', () => {
      const vendor = { ...baseVendor, status: VendorStatus.BLACKLISTED };
      const result = evaluateHardFilters(vendor, mockRequirement, mockValidDocs);
      expect(result.eligible).toBe(false);
      expect(result.disqualificationReasons[0]).toContain('BLACKLISTED');
    });

    it('should disqualify when vendor does not support required category', () => {
      const vendor = { ...baseVendor, categories: ['Civil Engineering', 'Plumbing'] };
      const result = evaluateHardFilters(vendor, mockRequirement, mockValidDocs);
      expect(result.eligible).toBe(false);
      expect(result.disqualificationReasons[0]).toContain('does not support required category');
    });

    it('should disqualify when rating is below minimumRating threshold', () => {
      const vendor = { ...baseVendor, rating: 3.5 };
      const result = evaluateHardFilters(vendor, mockRequirement, mockValidDocs);
      expect(result.eligible).toBe(false);
      expect(result.disqualificationReasons[0]).toContain('below minimum required rating');
    });

    it('should disqualify when vendor does not operate in target location', () => {
      const vendor = {
        ...baseVendor,
        operatingLocations: [{ country: 'USA', state: 'NY', city: 'New York' }],
      };
      const result = evaluateHardFilters(vendor, mockRequirement, mockValidDocs);
      expect(result.eligible).toBe(false);
      expect(result.disqualificationReasons[0]).toContain('does not operate in requirement region');
    });

    it('should disqualify when mandatory compliance document is missing', () => {
      // Only has INSURANCE, missing SAFETY_CERTIFICATE
      const partialDocs = [mockValidDocs[0]];
      const result = evaluateHardFilters(baseVendor, mockRequirement, partialDocs);
      expect(result.eligible).toBe(false);
      expect(result.disqualificationReasons[0]).toContain('Mandatory compliance document missing: SAFETY_CERTIFICATE');
    });

    it('should disqualify when mandatory compliance document is expired', () => {
      const expiredDocs: VendorDocumentForRecommendation[] = [
        mockValidDocs[0],
        {
          _id: 'doc-expired',
          vendorId: 'v-001',
          documentType: DocumentType.SAFETY_CERTIFICATE,
          status: DocumentStatus.EXPIRED,
          expiresAt: new Date('2023-01-01'), // in the past
        },
      ];
      const result = evaluateHardFilters(baseVendor, mockRequirement, expiredDocs, new Date('2026-01-01'));
      expect(result.eligible).toBe(false);
      expect(result.disqualificationReasons[0]).toContain('is expired');
    });
  });

  describe('2. Normalized Scoring Calculations', () => {
    it('should calculate location scores accurately (City=100, State=80, Country=50)', () => {
      const cityVendor = {
        ...baseVendor,
        operatingLocations: [{ country: 'USA', state: 'TX', city: 'Austin' }],
      };
      const stateVendor = {
        ...baseVendor,
        operatingLocations: [{ country: 'USA', state: 'TX', city: 'Dallas' }],
      };
      const countryVendor = {
        ...baseVendor,
        operatingLocations: [{ country: 'USA', state: 'CA', city: 'Los Angeles' }],
      };

      const scoreCity = calculateNormalizedScores(cityVendor, mockRequirement, mockValidDocs);
      const scoreState = calculateNormalizedScores(stateVendor, mockRequirement, mockValidDocs);
      const scoreCountry = calculateNormalizedScores(countryVendor, mockRequirement, mockValidDocs);

      expect(scoreCity.location).toBe(100);
      expect(scoreState.location).toBe(80);
      expect(scoreCountry.location).toBe(50);
    });

    it('should calculate capability match overlap correctly', () => {
      // Vendor has 2 out of 3 required capabilities
      const partialVendor = {
        ...baseVendor,
        capabilities: ['High Voltage Wiring', 'Switchgear Installation'],
      };
      const scores = calculateNormalizedScores(partialVendor, mockRequirement, mockValidDocs);
      // 2 / 3 * 100 = 67
      expect(scores.capability).toBe(67);
    });

    it('should calculate weighted total score adhering to v1 formula', () => {
      const breakdown = {
        category: 100,
        location: 100,
        rating: 96,
        capability: 100,
        compliance: 100,
        experience: 90,
        availability: 95,
      };

      // 100*0.3 + 100*0.2 + 96*0.15 + 100*0.15 + 100*0.10 + 90*0.05 + 95*0.05
      // = 30 + 20 + 14.4 + 15 + 10 + 4.5 + 4.75 = 98.65
      const total = computeWeightedTotalScore(breakdown);
      expect(total).toBe(98.65);
    });
  });

  describe('3. Deterministic Tie-Breaking & Ranking', () => {
    it('should break ties deterministically by higher completed projects when scores, ratings, and compliance match', () => {
      const vendorA: VendorForRecommendation = {
        ...baseVendor,
        _id: 'v-A',
        name: 'Alpha Engineering',
        rating: 4.5,
        completedProjects: 30,
      };
      const vendorB: VendorForRecommendation = {
        ...baseVendor,
        _id: 'v-B',
        name: 'Beta Engineering',
        rating: 4.5,
        completedProjects: 20,
      };

      const docMap = {
        'v-A': mockValidDocs,
        'v-B': mockValidDocs,
      };

      const ranked = rankCandidateVendors([vendorB, vendorA], mockRequirement, docMap);

      expect(ranked[0].vendorId).toBe('v-A');
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].vendorId).toBe('v-B');
      expect(ranked[1].rank).toBe(2);
    });

    it('should break ties alphabetically by vendor name when all quantitative metrics are identical', () => {
      const vendor1: VendorForRecommendation = {
        ...baseVendor,
        _id: 'v-Z',
        name: 'Zenith Systems',
        rating: 4.5,
        completedProjects: 20,
        yearsOfExperience: 5,
      };
      const vendor2: VendorForRecommendation = {
        ...baseVendor,
        _id: 'v-A',
        name: 'Apex Systems',
        rating: 4.5,
        completedProjects: 20,
        yearsOfExperience: 5,
      };

      const docMap = {
        'v-Z': mockValidDocs,
        'v-A': mockValidDocs,
      };

      const ranked = rankCandidateVendors([vendor1, vendor2], mockRequirement, docMap);

      // Apex Systems should rank above Zenith Systems
      expect(ranked[0].vendorName).toBe('Apex Systems');
      expect(ranked[1].vendorName).toBe('Zenith Systems');
    });
  });

  describe('4. Full Single Vendor Evaluation & Explainability', () => {
    it('should generate explainability summary with strengths and score breakdown', () => {
      const evaluation = calculateVendorRecommendation({
        vendor: baseVendor,
        requirement: mockRequirement,
        documents: mockValidDocs,
      });

      expect(evaluation.eligible).toBe(true);
      expect(evaluation.score).toBeGreaterThan(90);
      expect(evaluation.explanation.strengths.length).toBeGreaterThan(0);
      expect(evaluation.explanation.summary).toMatch(/top-tier/i);
      expect(evaluation.explanation.scoreBreakdown.category).toBe(100);
    });
  });
});
