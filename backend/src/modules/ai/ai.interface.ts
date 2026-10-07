export interface RankedCandidateSummaryInput {
  vendorName: string;
  rank: number;
  score: number;
  eligibility: string;
  disqualificationReasons?: string[];
  strengths: string[];
  weaknesses: string[];
  scoreBreakdown: {
    category: number;
    location: number;
    rating: number;
    capability: number;
    compliance: number;
    experience: number;
    availability: number;
  };
}

export interface RecommendationSummaryInput {
  workRequirement: {
    id: string;
    title: string;
    category: string;
    location: string;
    estimatedValue?: number;
    currency?: string;
  };
  totalCandidates: number;
  rankedRecommendations: RankedCandidateSummaryInput[];
}

export interface AISummaryResult {
  summary: string;
  aiProvider: 'openai' | 'deterministic';
  model: string;
  promptVersion: string;
  generatedAt: Date;
}

export interface AIProvider {
  readonly name: 'openai' | 'deterministic';
  generateRecommendationSummary(input: RecommendationSummaryInput): Promise<string>;
}
