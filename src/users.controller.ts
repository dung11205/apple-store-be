import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { Roles } from './auth/decorators/roles.decorator';
import { RolesGuard } from './auth/guards/roles.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UserRole } from './auth/dto/user-role.enum';
import { User } from './auth/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserDto } from './auth/dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // 🟩 Lấy danh sách user
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.authService.findAllUsers();
  }

  // 🟨 Cập nhật thông tin user
  @Put(':id')
  @Roles(UserRole.ADMIN)
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const { name, email, role } = body;

    if (!name && !email && !role) {
      throw new BadRequestException('Không có dữ liệu để cập nhật');
    }

    const user = await this.userModel.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true },
    );

    if (!user) throw new BadRequestException('Không tìm thấy người dùng');
    return user;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('id') id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new BadRequestException('Không tìm thấy người dùng');
    return { message: 'Đã xóa người dùng thành công' };
  }
}
