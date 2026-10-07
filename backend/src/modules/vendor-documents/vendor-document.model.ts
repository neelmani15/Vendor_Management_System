import { Schema, model, Types } from 'mongoose';
import { DocumentType, DocumentStatus } from '../../common/constants/enums';

export interface IVendorDocument {
  _id?: any;
  vendorId: Types.ObjectId;
  documentType: DocumentType;
  documentNumber: string;
  issuedAt: Date;
  expiresAt: Date;
  status: DocumentStatus;
  storageKey: string;
  fileName: string;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
}

const vendorDocumentSchema = new Schema<IVendorDocument>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: Object.values(DocumentType),
      required: true,
      index: true,
    },
    documentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    issuedAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(DocumentStatus),
      default: DocumentStatus.PENDING_VERIFICATION,
      required: true,
      index: true,
    },
    storageKey: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      default: 'application/pdf',
    },
  },
  {
    timestamps: true,
  }
);

vendorDocumentSchema.index({ vendorId: 1, documentType: 1 });
vendorDocumentSchema.index({ status: 1, expiresAt: 1 });

export const VendorDocumentModel = model<IVendorDocument>('VendorDocument', vendorDocumentSchema);
