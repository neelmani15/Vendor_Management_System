import { Schema, model, Types } from 'mongoose';

export interface IAISummary {
  workRequirementId: Types.ObjectId;
  recommendationRunId?: Types.ObjectId;
  summary: string;
  aiProvider: 'openai' | 'deterministic';
  model: string;
  promptVersion: string;
  generatedAt: Date;
}

const aiSummarySchema = new Schema<IAISummary>(
  {
    workRequirementId: {
      type: Schema.Types.ObjectId,
      ref: 'WorkRequirement',
      required: true,
      index: true,
    },
    recommendationRunId: {
      type: Schema.Types.ObjectId,
      ref: 'RecommendationRun',
      index: true,
    },
    summary: {
      type: String,
      required: true,
    },
    aiProvider: {
      type: String,
      enum: ['openai', 'deterministic'],
      required: true,
    },
    model: {
      type: String,
      required: true,
      default: 'deterministic-v1',
    },
    promptVersion: {
      type: String,
      required: true,
      default: 'v1',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const AISummaryModel = model<IAISummary>('AISummary', aiSummarySchema);
