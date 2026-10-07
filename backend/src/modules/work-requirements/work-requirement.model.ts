import { Schema, model, Types } from 'mongoose';
import {
  WorkPriority,
  WorkStatus,
  VendorType,
  DocumentType,
} from '../../common/constants/enums';
import { IOperatingLocation } from '../vendors/vendor.model';

export interface IWorkRequirement {
  _id?: any;
  title: string;
  description: string;
  category: string;
  location: IOperatingLocation;
  estimatedValue: number;
  currency: string;
  priority: WorkPriority;
  expectedStartDate: Date;
  requiredCapabilities: string[];
  preferredVendorTypes: VendorType[];
  minimumRating: number;
  complianceRequirements: DocumentType[];
  status: WorkStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const requirementLocationSchema = new Schema<IOperatingLocation>(
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

const workRequirementSchema = new Schema<IWorkRequirement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    location: {
      type: requirementLocationSchema,
      required: true,
    },
    estimatedValue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      trim: true,
    },
    priority: {
      type: String,
      enum: Object.values(WorkPriority),
      default: WorkPriority.MEDIUM,
      required: true,
      index: true,
    },
    expectedStartDate: {
      type: Date,
      required: true,
    },
    requiredCapabilities: {
      type: [String],
      default: [],
    },
    preferredVendorTypes: {
      type: [String],
      enum: Object.values(VendorType),
      default: [],
    },
    minimumRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    complianceRequirements: {
      type: [String],
      enum: Object.values(DocumentType),
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(WorkStatus),
      default: WorkStatus.OPEN,
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

workRequirementSchema.index({ status: 1, category: 1 });
workRequirementSchema.index({ createdAt: -1 });

export const WorkRequirementModel = model<IWorkRequirement>('WorkRequirement', workRequirementSchema);
