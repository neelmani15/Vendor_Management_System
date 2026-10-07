import { z } from 'zod';
import {
  VendorType,
  VendorStatus,
  OnboardingStatus,
  ComplianceStatus,
} from '../../common/constants/enums';

const operatingLocationSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const vendorContactSchema = z.object({
  primaryContactName: z.string().min(1, 'Primary contact name is required'),
  email: z.string().email('Valid contact email is required'),
  phone: z.string().min(1, 'Contact phone number is required'),
});

export const createVendorSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Vendor name is required'),
    vendorType: z.nativeEnum(VendorType).default(VendorType.COMPANY),
    categories: z.array(z.string().min(1)).min(1, 'At least one category is required'),
    description: z.string().optional().default(''),
    contact: vendorContactSchema,
    operatingLocations: z.array(operatingLocationSchema).min(1, 'At least one operating location is required'),
    rating: z.number().min(0).max(5).optional().default(0),
    status: z.nativeEnum(VendorStatus).optional().default(VendorStatus.ACTIVE),
    onboardingStatus: z.nativeEnum(OnboardingStatus).optional().default(OnboardingStatus.VERIFIED),
    yearsOfExperience: z.number().min(0).optional().default(0),
    completedProjects: z.number().min(0).optional().default(0),
    averageProjectValue: z.number().min(0).optional().default(0),
    capabilities: z.array(z.string()).optional().default([]),
    serviceAreas: z.array(z.string()).optional().default([]),
    complianceStatus: z.nativeEnum(ComplianceStatus).optional().default(ComplianceStatus.UNDER_REVIEW),
  }),
});

export const updateVendorSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Vendor ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    vendorType: z.nativeEnum(VendorType).optional(),
    categories: z.array(z.string().min(1)).optional(),
    description: z.string().optional(),
    contact: vendorContactSchema.partial().optional(),
    operatingLocations: z.array(operatingLocationSchema).optional(),
    rating: z.number().min(0).max(5).optional(),
    status: z.nativeEnum(VendorStatus).optional(),
    onboardingStatus: z.nativeEnum(OnboardingStatus).optional(),
    yearsOfExperience: z.number().min(0).optional(),
    completedProjects: z.number().min(0).optional(),
    averageProjectValue: z.number().min(0).optional(),
    capabilities: z.array(z.string()).optional(),
    serviceAreas: z.array(z.string()).optional(),
    complianceStatus: z.nativeEnum(ComplianceStatus).optional(),
  }),
});

export const listVendorsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    vendorType: z.nativeEnum(VendorType).optional(),
    status: z.nativeEnum(VendorStatus).optional(),
    complianceStatus: z.nativeEnum(ComplianceStatus).optional(),
    minimumRating: z.string().transform((v) => parseFloat(v)).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    page: z.string().transform((v) => Math.max(1, parseInt(v, 10))).optional().default('1'),
    limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10)))).optional().default('20'),
    sortBy: z.enum(['rating', 'createdAt', 'completedProjects', 'yearsOfExperience', 'name']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>['body'];
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>['body'];
export type ListVendorsQuery = z.infer<typeof listVendorsQuerySchema>['query'];
