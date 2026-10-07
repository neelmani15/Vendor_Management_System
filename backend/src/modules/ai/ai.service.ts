import { AIProvider, RecommendationSummaryInput, AISummaryResult } from './ai.interface';
import { OpenAIProvider } from './openai.provider';
import { DeterministicFallbackProvider } from './deterministic-fallback.provider';
import { AISummaryModel } from './ai-summary.model';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { Types } from 'mongoose';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../common/constants/enums';
import { AuthenticatedUser } from '../../common/types';

export class AIService {
  private static openaiProvider = new OpenAIProvider();
  private static fallbackProvider = new DeterministicFallbackProvider();

  public static async generateSummary(
    input: RecommendationSummaryInput,
    recommendationRunId?: string,
    actor?: AuthenticatedUser
  ): Promise<AISummaryResult> {
    let summary: string;
    let usedProvider: 'openai' | 'deterministic' = 'deterministic';
    let modelName = 'deterministic-template-v1';

    if (env.AI_PROVIDER === 'openai' && env.OPENAI_API_KEY) {
      try {
        summary = await this.openaiProvider.generateRecommendationSummary(input);
        usedProvider = 'openai';
        modelName = env.OPENAI_MODEL;
      } catch (error) {
        logger.warn(
          { error: (error as Error).message },
          'OpenAI summary generation failed. Engaging Deterministic Fallback Provider.'
        );
        summary = await this.fallbackProvider.generateRecommendationSummary(input);
        usedProvider = 'deterministic';
        modelName = 'deterministic-fallback-v1';
      }
    } else {
      summary = await this.fallbackProvider.generateRecommendationSummary(input);
      usedProvider = 'deterministic';
      modelName = 'deterministic-template-v1';
    }

    const generatedAt = new Date();
    const promptVersion = 'v1';

    // Persist to AISummary collection for traceability
    try {
      await AISummaryModel.create({
        workRequirementId: new Types.ObjectId(input.workRequirement.id),
        recommendationRunId: recommendationRunId ? new Types.ObjectId(recommendationRunId) : undefined,
        summary,
        aiProvider: usedProvider,
        model: modelName,
        promptVersion,
        generatedAt,
      });

      await AuditService.log({
        actorId: actor?.id,
        actorEmail: actor?.email,
        action: AuditAction.AI_SUMMARY_GENERATED,
        entityType: 'AISummary',
        entityId: input.workRequirement.id,
        metadata: { aiProvider: usedProvider, model: modelName },
      });
    } catch (saveError) {
      logger.error({ saveError }, 'Failed to save AI summary record');
    }

    return {
      summary,
      aiProvider: usedProvider,
      model: modelName,
      promptVersion,
      generatedAt,
    };
  }
}
