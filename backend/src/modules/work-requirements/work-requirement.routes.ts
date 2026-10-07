import { Router } from 'express';
import { WorkRequirementController } from './work-requirement.controller';
import { validate } from '../../common/middleware/validate';
import {
  createWorkRequirementSchema,
  updateWorkRequirementSchema,
  listWorkRequirementsQuerySchema,
} from './work-requirement.schema';
import { authenticate, authorize } from '../../common/middleware/auth';
import { UserRole } from '../../common/constants/roles';

const router = Router();

router.get('/', authenticate, validate(listWorkRequirementsQuerySchema), WorkRequirementController.list);
router.get('/:id', authenticate, WorkRequirementController.getById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.PROCUREMENT_USER),
  validate(createWorkRequirementSchema),
  WorkRequirementController.create
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER),
  validate(updateWorkRequirementSchema),
  WorkRequirementController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  WorkRequirementController.delete
);

export const workRequirementRoutes = router;
