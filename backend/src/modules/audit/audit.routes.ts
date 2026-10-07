import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticate, authorize } from '../../common/middleware/auth';
import { UserRole } from '../../common/constants/roles';

const router = Router();

router.get('/', authenticate, authorize(UserRole.ADMIN), AuditController.list);

export const auditRoutes = router;
