import { describe, it, expect } from 'vitest';
import { DeterministicFallbackProvider } from '../../src/modules/ai/deterministic-fallback.provider';
import { RecommendationSummaryInput } from '../../src/modules/ai/ai.interface';

describe('Deterministic Fallback AI Provider Tests', () => {
  const provider = new DeterministicFallbackProvider();

  it('should generate an executive summary when eligible vendors exist', async () => {
    const input: RecommendationSummaryInput = {
      workRequirement: {
        id: 'req-123',
        title: 'Austin Substation Automation',
        category: 'Electrical Engineering',
        location: 'Austin, TX, USA',
      },
      totalCandidates: 3,
      rankedRecommendations: [
        {
          vendorName: 'Apex Power Grid Systems',
          rank: 1,
          score: 95.5,
          eligibility: 'ELIGIBLE',
          strengths: ['Exact category match', 'Physical presence in Austin, TX', 'Valid compliance documents'],
          weaknesses: [],
          scoreBreakdown: {
            category: 100,
            location: 100,
            rating: 96,
            capability: 100,
            compliance: 100,
            experience: 85,
            availability: 95,
          },
        },
        {
          vendorName: 'Beacon Power Labs',
          rank: 2,
          score: 88.0,
          eligibility: 'ELIGIBLE',
          strengths: ['State coverage'],
          weaknesses: ['Lower experience portfolio'],
          scoreBreakdown: {
            category: 100,
            location: 80,
            rating: 90,
            capability: 80,
            compliance: 100,
            experience: 70,
            availability: 90,
          },
        },
        {
          vendorName: 'Voltaic Energy',
          rank: 3,
          score: 0,
          eligibility: 'DISQUALIFIED',
          disqualificationReasons: ['Required compliance document SAFETY_CERTIFICATE is expired'],
          strengths: [],
          weaknesses: ['Expired safety certificate'],
          scoreBreakdown: {
            category: 100,
            location: 100,
            rating: 94,
            capability: 100,
            compliance: 0,
            experience: 70,
            availability: 95,
          },
        },
      ],
    };

    const summary = await provider.generateRecommendationSummary(input);

    expect(summary).toBeDefined();
    expect(summary).toContain('Apex Power Grid Systems');
    expect(summary).toContain('95.50/100');
    expect(summary).toContain('Beacon Power Labs');
    expect(summary).toContain('Voltaic Energy');
    expect(summary).toContain('SAFETY_CERTIFICATE');
    expect(summary).toContain('Rankings and scores are computed mathematically');
  });

  it('should handle zero eligible vendors gracefully with actionable next steps', async () => {
    const input: RecommendationSummaryInput = {
      workRequirement: {
        id: 'req-999',
        title: 'Restricted Security Overhaul',
        category: 'Security Services',
        location: 'Remote Site',
      },
      totalCandidates: 1,
      rankedRecommendations: [
        {
          vendorName: 'Rogue Guard',
          rank: 1,
          score: 0,
          eligibility: 'DISQUALIFIED',
          disqualificationReasons: ['Vendor status is BLACKLISTED'],
          strengths: [],
          weaknesses: ['Blacklisted'],
          scoreBreakdown: {
            category: 100,
            location: 0,
            rating: 40,
            capability: 50,
            compliance: 0,
            experience: 10,
            availability: 0,
          },
        },
      ],
    };

    const summary = await provider.generateRecommendationSummary(input);

    expect(summary).toContain('No eligible vendors were found');
    expect(summary).toContain('Rogue Guard');
    expect(summary).toContain('BLACKLISTED');
  });
});
