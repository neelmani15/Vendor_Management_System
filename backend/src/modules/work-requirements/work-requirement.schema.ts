import { z } from 'zod';
import { WorkPriority, WorkStatus, VendorType, DocumentType } from '../../common/constants/enums';

const requirementLocationSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const createWorkRequirementSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    category: z.string().min(1, 'Category is required'),
    location: requirementLocationSchema,
    estimatedValue: z.number().min(0).optional().default(0),
    currency: z.string().optional().default('USD'),
    priority: z.nativeEnum(WorkPriority).optional().default(WorkPriority.MEDIUM),
    expectedStartDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid expectedStartDate is required'),
    requiredCapabilities: z.array(z.string()).optional().default([]),
    preferredVendorTypes: z.array(z.nativeEnum(VendorType)).optional().default([]),
    minimumRating: z.number().min(0).max(5).optional().default(0),
    complianceRequirements: z.array(z.nativeEnum(DocumentType)).optional().default([]),
    status: z.nativeEnum(WorkStatus).optional().default(WorkStatus.OPEN),
  }),
});

export const updateWorkRequirementSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Requirement ID is required'),
  }),
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    category: z.string().min(1).optional(),
    location: requirementLocationSchema.optional(),
    estimatedValue: z.number().min(0).optional(),
    currency: z.string().optional(),
    priority: z.nativeEnum(WorkPriority).optional(),
    expectedStartDate: z.string().refine((val) => !isNaN(Date.parse(val))).optional(),
    requiredCapabilities: z.array(z.string()).optional(),
    preferredVendorTypes: z.array(z.nativeEnum(VendorType)).optional(),
    minimumRating: z.number().min(0).max(5).optional(),
    complianceRequirements: z.array(z.nativeEnum(DocumentType)).optional(),
    status: z.nativeEnum(WorkStatus).optional(),
  }),
});

export const listWorkRequirementsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    status: z.nativeEnum(WorkStatus).optional(),
    priority: z.nativeEnum(WorkPriority).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    page: z.string().transform((v) => Math.max(1, parseInt(v, 10))).optional().default('1'),
    limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10)))).optional().default('20'),
    sortBy: z.enum(['createdAt', 'priority', 'estimatedValue', 'expectedStartDate', 'title']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateWorkRequirementInput = z.infer<typeof createWorkRequirementSchema>['body'];
export type UpdateWorkRequirementInput = z.infer<typeof updateWorkRequirementSchema>['body'];
export type ListWorkRequirementsQuery = z.infer<typeof listWorkRequirementsQuerySchema>['query'];
