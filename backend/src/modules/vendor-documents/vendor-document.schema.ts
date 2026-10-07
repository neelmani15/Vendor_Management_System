import { z } from 'zod';
import { DocumentType, DocumentStatus } from '../../common/constants/enums';

export const createDocumentSchema = z.object({
  body: z.object({
    vendorId: z.string().min(1, 'Vendor ID is required'),
    documentType: z.nativeEnum(DocumentType),
    documentNumber: z.string().min(1, 'Document number is required'),
    issuedAt: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid issuedAt date is required'),
    expiresAt: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid expiresAt date is required'),
    status: z.nativeEnum(DocumentStatus).optional().default(DocumentStatus.VALID),
    storageKey: z.string().optional(),
    fileName: z.string().min(1, 'File name is required'),
    mimeType: z.string().optional().default('application/pdf'),
  }),
});

export const updateDocumentStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Document ID is required'),
  }),
  body: z.object({
    status: z.nativeEnum(DocumentStatus),
  }),
});

export const listDocumentsQuerySchema = z.object({
  query: z.object({
    vendorId: z.string().optional(),
    documentType: z.nativeEnum(DocumentType).optional(),
    status: z.nativeEnum(DocumentStatus).optional(),
  }),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>['body'];
export type UpdateDocumentStatusInput = z.infer<typeof updateDocumentStatusSchema>['body'];
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>['query'];
