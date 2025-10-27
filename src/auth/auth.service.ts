import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';

interface JwtPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin';
}

export interface UserResponse {
  id: string;
  email: string;
  role: 'user' | 'admin';
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<UserResponse> {
    const { name, email, password, role = 'user' } = dto;

    const existing = await this.userModel.findOne({ email });
    if (existing) throw new ConflictException('Email đã tồn tại');

    const hashed = await bcrypt.hash(password, 10);

    const userData: Partial<UserDocument> = {
      name,
      email,
      password: hashed,
      role,
    };

    const user = await this.userModel.create(userData);
    if (!user) throw new UnauthorizedException('Lỗi tạo user');

    const _id = (user._id as Types.ObjectId).toString();

    const payload: JwtPayload = {
      sub: _id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      id: _id,
      email: user.email,
      role: user.role,
      access_token: token,
    };
  }

  async login(email: string, password: string): Promise<UserResponse> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Sai email hoặc mật khẩu');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Sai email hoặc mật khẩu');

    const _id = (user._id as Types.ObjectId).toString();

    const payload: JwtPayload = {
      sub: _id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      id: _id,
      email: user.email,
      role: user.role,
      access_token: token,
    };
  }

  async validateUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password').exec();
  }
}
