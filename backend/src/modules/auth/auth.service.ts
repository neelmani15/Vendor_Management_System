import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from './user.model';
import { RegisterInput, LoginInput } from './auth.schema';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../common/errors';
import { env } from '../../config/env';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../common/constants/enums';

export class AuthService {
  private static generateToken(user: IUser): string {
    return jwt.sign(
      {
        id: (user as any)._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );
  }

  public static async register(input: RegisterInput) {
    const existing = await UserModel.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await UserModel.create({
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
      role: input.role,
      isActive: true,
    });

    await AuditService.log({
      actorId: user._id.toString(),
      actorEmail: user.email,
      action: AuditAction.USER_REGISTERED,
      entityType: 'User',
      entityId: user._id.toString(),
      metadata: { role: user.role },
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  public static async login(input: LoginInput) {
    const user = await UserModel.findOne({ email: input.email.toLowerCase() });
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password credentials');
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password credentials');
    }

    await AuditService.log({
      actorId: user._id.toString(),
      actorEmail: user.email,
      action: AuditAction.USER_LOGGED_IN,
      entityType: 'User',
      entityId: user._id.toString(),
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  public static async getProfile(userId: string) {
    const user = await UserModel.findById(userId).select('-passwordHash').lean();
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
