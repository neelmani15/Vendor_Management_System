import { Router } from 'express';
import { RecommendationsController } from './recommendations.controller';
import { authenticate } from '../../common/middleware/auth';

const router = Router({ mergeParams: true });

router.get('/', authenticate, RecommendationsController.getRecommendations);
router.post('/run', authenticate, RecommendationsController.getRecommendations);
router.get('/history', authenticate, RecommendationsController.getHistory);

export const recommendationRoutes = router;
