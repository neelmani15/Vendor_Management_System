import { FilterQuery, Types } from 'mongoose';
import { VendorDocumentModel, IVendorDocument } from './vendor-document.model';
import { CreateDocumentInput, ListDocumentsQuery } from './vendor-document.schema';
import { DocumentStatus } from '../../common/constants/enums';

export class VendorDocumentRepository {
  public static async create(data: CreateDocumentInput): Promise<IVendorDocument> {
    const storageKey = data.storageKey || `vendors/${data.vendorId}/docs/${Date.now()}-${data.fileName}`;
    return VendorDocumentModel.create({
      ...data,
      storageKey,
      vendorId: new Types.ObjectId(data.vendorId),
    });
  }

  public static async findById(id: string): Promise<IVendorDocument | null> {
    return VendorDocumentModel.findById(id).lean();
  }

  public static async findByVendorId(vendorId: string): Promise<IVendorDocument[]> {
    return VendorDocumentModel.find({ vendorId: new Types.ObjectId(vendorId) }).lean();
  }

  public static async findWithFilters(query: ListDocumentsQuery): Promise<IVendorDocument[]> {
    const filter: FilterQuery<IVendorDocument> = {};
    if (query.vendorId) filter.vendorId = new Types.ObjectId(query.vendorId);
    if (query.documentType) filter.documentType = query.documentType;
    if (query.status) filter.status = query.status;

    return VendorDocumentModel.find(filter).sort({ expiresAt: 1 }).lean();
  }

  public static async updateStatus(id: string, status: DocumentStatus): Promise<IVendorDocument | null> {
    return VendorDocumentModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
  }

  public static async delete(id: string): Promise<boolean> {
    const res = await VendorDocumentModel.findByIdAndDelete(id);
    return !!res;
  }
}
