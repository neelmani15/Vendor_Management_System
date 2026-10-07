export type UserRole = 'ADMIN' | 'PROCUREMENT_MANAGER' | 'PROCUREMENT_USER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface OperatingLocation {
  country: string;
  state: string;
  city: string;
  postalCode?: string;
  address?: string;
}

export interface VendorContact {
  primaryContactName: string;
  email: string;
  phone: string;
}

export interface Vendor {
  _id: string;
  name: string;
  vendorType: 'INDIVIDUAL' | 'COMPANY' | 'CONTRACTOR' | 'AGENCY' | 'SUPPLIER' | 'SERVICE_PROVIDER';
  categories: string[];
  description: string;
  contact: VendorContact;
  operatingLocations: OperatingLocation[];
  rating: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLACKLISTED';
  onboardingStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  yearsOfExperience: number;
  completedProjects: number;
  averageProjectValue: number;
  capabilities: string[];
  serviceAreas: string[];
  complianceStatus: 'COMPLIANT' | 'EXPIRING_SOON' | 'NON_COMPLIANT' | 'UNDER_REVIEW';
  createdAt: string;
}

export interface VendorDocument {
  _id: string;
  vendorId: string;
  documentType: 'TAX_REGISTRATION' | 'INSURANCE' | 'TRADE_LICENSE' | 'SAFETY_CERTIFICATE' | 'AGREEMENT';
  documentNumber: string;
  issuedAt: string;
  expiresAt: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'PENDING_VERIFICATION' | 'REJECTED';
  storageKey: string;
  fileName: string;
  mimeType: string;
  createdAt: string;
}

export interface WorkRequirement {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: OperatingLocation;
  estimatedValue: number;
  currency: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedStartDate: string;
  requiredCapabilities: string[];
  preferredVendorTypes: string[];
  minimumRating: number;
  complianceRequirements: string[];
  status: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  createdAt: string;
}

export interface ScoreBreakdown {
  category: number;
  location: number;
  rating: number;
  capability: number;
  compliance: number;
  experience: number;
  availability: number;
}

export interface RecommendationExplanation {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  scoreBreakdown: ScoreBreakdown;
}

export interface RecommendationItem {
  vendorId: string;
  vendorName: string;
  rank: number;
  score: number;
  eligibility: 'ELIGIBLE' | 'DISQUALIFIED';
  disqualificationReasons?: string[];
  explanation: RecommendationExplanation;
}

export interface AISummaryMeta {
  summary: string;
  aiProvider: 'openai' | 'deterministic';
  model: string;
  promptVersion: string;
  generatedAt: string;
}

export interface RecommendationResponse {
  recommendations: RecommendationItem[];
  meta: {
    total: number;
    totalCandidates: number;
    limit: number;
    offset: number;
    runId: string;
    algorithmVersion: string;
    aiSummary?: AISummaryMeta | null;
  };
}

export interface AuditLog {
  _id: string;
  actorId?: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}
