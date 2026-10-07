import { FilterQuery, Types } from 'mongoose';
import { WorkRequirementModel, IWorkRequirement } from './work-requirement.model';
import { CreateWorkRequirementInput, UpdateWorkRequirementInput, ListWorkRequirementsQuery } from './work-requirement.schema';

export class WorkRequirementRepository {
  public static async create(data: CreateWorkRequirementInput, createdBy: string): Promise<IWorkRequirement> {
    return WorkRequirementModel.create({
      ...data,
      expectedStartDate: new Date(data.expectedStartDate),
      createdBy: new Types.ObjectId(createdBy),
    });
  }

  public static async findById(id: string): Promise<IWorkRequirement | null> {
    return WorkRequirementModel.findById(id).lean();
  }

  public static async update(id: string, data: UpdateWorkRequirementInput): Promise<IWorkRequirement | null> {
    const updatePayload: Record<string, unknown> = { ...data };
    if (data.expectedStartDate) {
      updatePayload.expectedStartDate = new Date(data.expectedStartDate);
    }
    return WorkRequirementModel.findByIdAndUpdate(id, { $set: updatePayload }, { new: true, runValidators: true }).lean();
  }

  public static async delete(id: string): Promise<boolean> {
    const res = await WorkRequirementModel.findByIdAndDelete(id);
    return !!res;
  }

  public static async findWithFilters(query: ListWorkRequirementsQuery) {
    const filter: FilterQuery<IWorkRequirement> = {};

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.category) filter.category = query.category;
    if (query.city) filter['location.city'] = new RegExp(query.city, 'i');
    if (query.state) filter['location.state'] = new RegExp(query.state, 'i');

    if (query.search) {
      filter.$or = [
        { title: new RegExp(query.search, 'i') },
        { description: new RegExp(query.search, 'i') },
        { category: new RegExp(query.search, 'i') },
        { requiredCapabilities: new RegExp(query.search, 'i') },
      ];
    }

    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
    const sortField = query.sortBy || 'createdAt';
    const sort: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      WorkRequirementModel.find(filter).sort(sort).skip(offset).limit(limit).lean(),
      WorkRequirementModel.countDocuments(filter),
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
}
