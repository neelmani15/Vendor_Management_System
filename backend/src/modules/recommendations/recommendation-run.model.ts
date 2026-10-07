import { Schema, model, Types } from 'mongoose';

export interface IScoreBreakdown {
  category: number;
  location: number;
  rating: number;
  capability: number;
  compliance: number;
  experience: number;
  availability: number;
}

export interface IRecommendationExplanation {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  scoreBreakdown: IScoreBreakdown;
}

export interface IRecommendationItem {
  vendorId: Types.ObjectId;
  vendorName: string;
  rank: number;
  score: number;
  eligibility: 'ELIGIBLE' | 'DISQUALIFIED';
  disqualificationReasons?: string[];
  explanation: IRecommendationExplanation;
}

export interface IRecommendationRun {
  workRequirementId: Types.ObjectId;
  algorithmVersion: string;
  generatedAt: Date;
  generatedBy?: Types.ObjectId;
  candidatesEvaluated: number;
  recommendations: IRecommendationItem[];
  createdAt: Date;
  updatedAt: Date;
}

const scoreBreakdownSchema = new Schema<IScoreBreakdown>(
  {
    category: { type: Number, required: true },
    location: { type: Number, required: true },
    rating: { type: Number, required: true },
    capability: { type: Number, required: true },
    compliance: { type: Number, required: true },
    experience: { type: Number, required: true },
    availability: { type: Number, required: true },
  },
  { _id: false }
);

const explanationSchema = new Schema<IRecommendationExplanation>(
  {
    summary: { type: String, required: true },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    scoreBreakdown: { type: scoreBreakdownSchema, required: true },
  },
  { _id: false }
);

const recommendationItemSchema = new Schema<IRecommendationItem>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    vendorName: {
      type: String,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    eligibility: {
      type: String,
      enum: ['ELIGIBLE', 'DISQUALIFIED'],
      required: true,
    },
    disqualificationReasons: {
      type: [String],
      default: [],
    },
    explanation: {
      type: explanationSchema,
      required: true,
    },
  },
  { _id: false }
);

const recommendationRunSchema = new Schema<IRecommendationRun>(
  {
    workRequirementId: {
      type: Schema.Types.ObjectId,
      ref: 'WorkRequirement',
      required: true,
      index: true,
    },
    algorithmVersion: {
      type: String,
      required: true,
      default: 'v1',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    candidatesEvaluated: {
      type: Number,
      required: true,
      default: 0,
    },
    recommendations: {
      type: [recommendationItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

recommendationRunSchema.index({ workRequirementId: 1, generatedAt: -1 });

export const RecommendationRunModel = model<IRecommendationRun>(
  'RecommendationRun',
  recommendationRunSchema
);
