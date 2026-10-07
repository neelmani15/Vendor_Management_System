import { Router } from 'express';
import { VendorController } from './vendor.controller';
import { validate } from '../../common/middleware/validate';
import {
  createVendorSchema,
  updateVendorSchema,
  listVendorsQuerySchema,
} from './vendor.schema';
import { authenticate, authorize } from '../../common/middleware/auth';
import { UserRole } from '../../common/constants/roles';

const router = Router();

// Publicly authenticated endpoints (any role can read)
router.get('/', authenticate, validate(listVendorsQuerySchema), VendorController.list);
router.get('/:id', authenticate, VendorController.getById);

// Manager / Admin operations
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER),
  validate(createVendorSchema),
  VendorController.create
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER),
  validate(updateVendorSchema),
  VendorController.update
);

// Admin-only operations
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  VendorController.delete
);

export const vendorRoutes = router;
