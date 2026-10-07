export const VendorType = {
  INDIVIDUAL: 'INDIVIDUAL',
  COMPANY: 'COMPANY',
  CONTRACTOR: 'CONTRACTOR',
  AGENCY: 'AGENCY',
  SUPPLIER: 'SUPPLIER',
  SERVICE_PROVIDER: 'SERVICE_PROVIDER',
} as const;
export type VendorType = (typeof VendorType)[keyof typeof VendorType];

export const VendorStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  BLACKLISTED: 'BLACKLISTED',
} as const;
export type VendorStatus = (typeof VendorStatus)[keyof typeof VendorStatus];

export const OnboardingStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const;
export type OnboardingStatus = (typeof OnboardingStatus)[keyof typeof OnboardingStatus];

export const ComplianceStatus = {
  COMPLIANT: 'COMPLIANT',
  EXPIRING_SOON: 'EXPIRING_SOON',
  NON_COMPLIANT: 'NON_COMPLIANT',
  UNDER_REVIEW: 'UNDER_REVIEW',
} as const;
export type ComplianceStatus = (typeof ComplianceStatus)[keyof typeof ComplianceStatus];

export const DocumentType = {
  TAX_REGISTRATION: 'TAX_REGISTRATION',
  INSURANCE: 'INSURANCE',
  TRADE_LICENSE: 'TRADE_LICENSE',
  SAFETY_CERTIFICATE: 'SAFETY_CERTIFICATE',
  AGREEMENT: 'AGREEMENT',
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const DocumentStatus = {
  VALID: 'VALID',
  EXPIRING_SOON: 'EXPIRING_SOON',
  EXPIRED: 'EXPIRED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  REJECTED: 'REJECTED',
} as const;
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const WorkPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type WorkPriority = (typeof WorkPriority)[keyof typeof WorkPriority];

export const WorkStatus = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type WorkStatus = (typeof WorkStatus)[keyof typeof WorkStatus];

export const AuditAction = {
  USER_REGISTERED: 'USER_REGISTERED',
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  VENDOR_CREATED: 'VENDOR_CREATED',
  VENDOR_UPDATED: 'VENDOR_UPDATED',
  VENDOR_STATUS_CHANGED: 'VENDOR_STATUS_CHANGED',
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  DOCUMENT_VERIFIED: 'DOCUMENT_VERIFIED',
  DOCUMENT_REJECTED: 'DOCUMENT_REJECTED',
  WORK_REQUIREMENT_CREATED: 'WORK_REQUIREMENT_CREATED',
  WORK_REQUIREMENT_UPDATED: 'WORK_REQUIREMENT_UPDATED',
  RECOMMENDATION_GENERATED: 'RECOMMENDATION_GENERATED',
  AI_SUMMARY_GENERATED: 'AI_SUMMARY_GENERATED',
  VENDOR_COMPLIANCE_REVIEWED: 'VENDOR_COMPLIANCE_REVIEWED',
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];
