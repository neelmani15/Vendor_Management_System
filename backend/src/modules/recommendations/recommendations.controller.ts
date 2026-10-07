import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types';
import { RecommendationsService } from './recommendations.service';
import { sendSuccess } from '../../common/utils/response';

export class RecommendationsController {
  public static async getRecommendations(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
      const minimumScore = req.query.minimumScore ? parseFloat(req.query.minimumScore as string) : undefined;
      const includeBreakdown = req.query.includeBreakdown !== 'false';
      const generateSummary = req.query.generateSummary !== 'false';

      const result = await RecommendationsService.generateRecommendations(
        req.params.id,
        {
          limit,
          offset,
          minimumScore,
          includeBreakdown,
          generateSummary,
        },
        req.user
      );

      sendSuccess(res, result.recommendations, 200, {
        total: result.total,
        totalCandidates: result.totalCandidates,
        limit: result.limit,
        offset: result.offset,
        runId: result.runId,
        algorithmVersion: result.algorithmVersion,
        aiSummary: result.aiSummary,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const runs = await RecommendationsService.getHistoricalRuns(req.params.id);
      sendSuccess(res, runs, 200);
    } catch (error) {
      next(error);
    }
  }
}
