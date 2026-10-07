import { IScoreBreakdown, IRecommendationExplanation } from '../recommendation-run.model';
import { IOperatingLocation } from '../../vendors/vendor.model';
import { VendorType, DocumentType, DocumentStatus, VendorStatus, OnboardingStatus } from '../../../common/constants/enums';

export interface VendorForRecommendation {
  _id: string;
  name: string;
  vendorType: VendorType;
  categories: string[];
  operatingLocations: IOperatingLocation[];
  rating: number;
  status: VendorStatus;
  onboardingStatus: OnboardingStatus;
  yearsOfExperience: number;
  completedProjects: number;
  capabilities: string[];
  complianceStatus: string;
}

export interface WorkRequirementForRecommendation {
  _id: string;
  title: string;
  category: string;
  location: IOperatingLocation;
  minimumRating: number;
  requiredCapabilities: string[];
  preferredVendorTypes: VendorType[];
  complianceRequirements: DocumentType[];
}

export interface VendorDocumentForRecommendation {
  _id: string;
  vendorId: string;
  documentType: DocumentType;
  status: DocumentStatus;
  expiresAt: Date | string;
}

export interface EvaluatedVendorCandidate {
  vendorId: string;
  vendorName: string;
  eligible: boolean;
  disqualificationReasons: string[];
  score: number;
  scoreBreakdown: IScoreBreakdown;
  explanation: IRecommendationExplanation;
  vendor: VendorForRecommendation; // Retained for tie-breaking comparison
}
