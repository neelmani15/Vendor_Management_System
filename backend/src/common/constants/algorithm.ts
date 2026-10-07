export const ALGORITHM_VERSIONS = {
  V1: 'v1',
} as const;

export type AlgorithmVersion = (typeof ALGORITHM_VERSIONS)[keyof typeof ALGORITHM_VERSIONS];

export interface AlgorithmWeights {
  category: number;
  location: number;
  rating: number;
  capability: number;
  compliance: number;
  experience: number;
  availability: number;
}

export const SCORING_WEIGHTS_V1: AlgorithmWeights = {
  category: 0.30,
  location: 0.20,
  rating: 0.15,
  capability: 0.15,
  compliance: 0.10,
  experience: 0.05,
  availability: 0.05,
};

export const ALGORITHM_CONFIGS: Record<AlgorithmVersion, { weights: AlgorithmWeights; description: string }> = {
  v1: {
    weights: SCORING_WEIGHTS_V1,
    description: 'Category 30%, Location 20%, Rating 15%, Capability 15%, Compliance 10%, Experience 5%, Availability 5%',
  },
};
