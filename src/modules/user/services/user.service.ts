import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../entities/user.entity';
import { RegisterDto } from '../../auth/dtos/register.dto';
import { IUserWithoutPassword } from '../interfaces/user.interface';
import { CacheService } from '../../../common/cache/services/cache.service';

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private cacheService: CacheService,
  ) {}

  async create(registerDto: RegisterDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({
      email: registerDto.email,
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
    });

    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    const cacheKey = `user:email:${email}`;

    return this.cacheService.getOrSet(
      cacheKey,
      () => this.userModel.findOne({ email }).exec(),
      300, // 5 minutes cache
    );
  }

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const cacheKey = `user:id:${id}`;

    return this.cacheService.getOrSet(
      cacheKey,
      () => this.userModel.findById(id).exec(),
      300, // 5 minutes cache
    );
  }

  async findAll(): Promise<UserDocument[]> {
    const cacheKey = 'users:all';

    return this.cacheService.getOrSet(
      cacheKey,
      () => this.userModel.find().select('-password').exec(),
      600, // 10 minutes cache
    );
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, { ...updateUserDto }, { new: true, runValidators: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Invalidate cache
    await this.invalidateUserCache(id);

    return user;
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }

    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }

    // Invalidate cache
    await this.invalidateUserCache(id);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await this.validatePassword(changePasswordDto.currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new ConflictException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getUserProfile(id: string): Promise<IUserWithoutPassword> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userObj = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment
    const { password, ...userProfile } = userObj;
    return userProfile as IUserWithoutPassword;
  }

  async activateUser(id: string): Promise<UserDocument> {
    return this.update(id, { isActive: true });
  }

  async deactivateUser(id: string): Promise<UserDocument> {
    return this.update(id, { isActive: false });
  }

  private async invalidateUserCache(id: string): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    if (user) {
      // Invalidate user-specific cache
      await this.cacheService.del(`user:id:${id}`);
      await this.cacheService.del(`user:email:${user.email}`);
    }

    // Invalidate users list cache
    await this.cacheService.del('users:all');
  }
}
