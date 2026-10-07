import { Schema, model } from 'mongoose';
import {
  VendorType,
  VendorStatus,
  OnboardingStatus,
  ComplianceStatus,
} from '../../common/constants/enums';

export interface IOperatingLocation {
  country: string;
  state: string;
  city: string;
  postalCode?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface IVendorContact {
  primaryContactName: string;
  email: string;
  phone: string;
}

export interface IVendor {
  _id?: any;
  name: string;
  vendorType: VendorType;
  categories: string[];
  description: string;
  contact: IVendorContact;
  operatingLocations: IOperatingLocation[];
  rating: number;
  status: VendorStatus;
  onboardingStatus: OnboardingStatus;
  yearsOfExperience: number;
  completedProjects: number;
  averageProjectValue: number;
  capabilities: string[];
  serviceAreas: string[];
  complianceStatus: ComplianceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const operatingLocationSchema = new Schema<IOperatingLocation>(
  {
    country: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, trim: true },
    address: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const vendorContactSchema = new Schema<IVendorContact>(
  {
    primaryContactName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const vendorSchema = new Schema<IVendor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    vendorType: {
      type: String,
      enum: Object.values(VendorType),
      required: true,
      default: VendorType.COMPANY,
      index: true,
    },
    categories: {
      type: [String],
      required: true,
      default: [],
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    contact: {
      type: vendorContactSchema,
      required: true,
    },
    operatingLocations: {
      type: [operatingLocationSchema],
      required: true,
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(VendorStatus),
      default: VendorStatus.ACTIVE,
      required: true,
      index: true,
    },
    onboardingStatus: {
      type: String,
      enum: Object.values(OnboardingStatus),
      default: OnboardingStatus.VERIFIED,
      required: true,
      index: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedProjects: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageProjectValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    capabilities: {
      type: [String],
      default: [],
      index: true,
    },
    serviceAreas: {
      type: [String],
      default: [],
    },
    complianceStatus: {
      type: String,
      enum: Object.values(ComplianceStatus),
      default: ComplianceStatus.UNDER_REVIEW,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal querying
vendorSchema.index({ status: 1, categories: 1, rating: -1 });
vendorSchema.index({ 'operatingLocations.city': 1, 'operatingLocations.state': 1 });
vendorSchema.index({ 'operatingLocations.country': 1 });
vendorSchema.index({ name: 'text', description: 'text', capabilities: 'text' });

export const VendorModel = model<IVendor>('Vendor', vendorSchema);
