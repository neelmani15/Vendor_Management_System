import { Router } from 'express';
import { VendorDocumentController } from './vendor-document.controller';
import { validate } from '../../common/middleware/validate';
import {
  createDocumentSchema,
  updateDocumentStatusSchema,
  listDocumentsQuerySchema,
} from './vendor-document.schema';
import { authenticate, authorize } from '../../common/middleware/auth';
import { UserRole } from '../../common/constants/roles';

const router = Router();

router.get('/', authenticate, validate(listDocumentsQuerySchema), VendorDocumentController.list);
router.get('/vendor/:vendorId', authenticate, VendorDocumentController.getByVendorId);
router.get('/:id', authenticate, VendorDocumentController.getById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER),
  validate(createDocumentSchema),
  VendorDocumentController.create
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER),
  validate(updateDocumentStatusSchema),
  VendorDocumentController.updateStatus
);

router.post(
  '/vendor/:vendorId/review-compliance',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER),
  VendorDocumentController.reviewCompliance
);

router.post(
  '/vendor/:vendorId/verify-all',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER),
  VendorDocumentController.verifyAllDocuments
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  VendorDocumentController.delete
);

export const vendorDocumentRoutes = router;
