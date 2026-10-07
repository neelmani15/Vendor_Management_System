import { FilterQuery } from 'mongoose';
import { VendorModel, IVendor } from './vendor.model';
import { CreateVendorInput, UpdateVendorInput, ListVendorsQuery } from './vendor.schema';
import { VendorStatus, OnboardingStatus } from '../../common/constants/enums';

export class VendorRepository {
  public static async create(data: CreateVendorInput): Promise<IVendor> {
    return VendorModel.create(data);
  }

  public static async findById(id: string): Promise<IVendor | null> {
    return VendorModel.findById(id).lean();
  }

  public static async update(id: string, data: UpdateVendorInput): Promise<IVendor | null> {
    return VendorModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
  }

  public static async delete(id: string): Promise<boolean> {
    const res = await VendorModel.findByIdAndDelete(id);
    return !!res;
  }

  public static async findWithFilters(query: ListVendorsQuery) {
    const filter: FilterQuery<IVendor> = {};

    if (query.status) {
      filter.status = query.status;
    }
    if (query.vendorType) {
      filter.vendorType = query.vendorType;
    }
    if (query.complianceStatus) {
      filter.complianceStatus = query.complianceStatus;
    }
    if (query.category) {
      filter.categories = query.category;
    }
    if (query.minimumRating !== undefined) {
      filter.rating = { $gte: query.minimumRating };
    }
    if (query.city) {
      filter['operatingLocations.city'] = new RegExp(query.city, 'i');
    }
    if (query.state) {
      filter['operatingLocations.state'] = new RegExp(query.state, 'i');
    }
    if (query.country) {
      filter['operatingLocations.country'] = new RegExp(query.country, 'i');
    }

    if (query.search) {
      filter.$or = [
        { name: new RegExp(query.search, 'i') },
        { description: new RegExp(query.search, 'i') },
        { capabilities: new RegExp(query.search, 'i') },
        { categories: new RegExp(query.search, 'i') },
      ];
    }

    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
    const sortField = query.sortBy || 'createdAt';
    const sort: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      VendorModel.find(filter).sort(sort).skip(offset).limit(limit).lean(),
      VendorModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      limit,
      offset,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Candidate reduction query for the Recommendation Engine:
   * Selects active, verified vendors operating in the required category and meeting baseline rating.
   */
  public static async findCandidateVendors(category: string, minimumRating = 0): Promise<IVendor[]> {
    return VendorModel.find({
      status: VendorStatus.ACTIVE,
      onboardingStatus: OnboardingStatus.VERIFIED,
      categories: category,
      rating: { $gte: minimumRating },
    }).lean();
  }
}
