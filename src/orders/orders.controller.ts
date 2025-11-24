import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 🟢 User tạo đơn
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const user = req.user as { id?: string; phone?: string };
    if (!user?.id)
      throw new BadRequestException('User ID không tồn tại trong token');

    const phone = createOrderDto.phone || user.phone;
    if (!phone) throw new BadRequestException('SĐT không được để trống');

    return this.ordersService.create({ ...createOrderDto, phone }, user.id);
  }

  // 🟢 User xem đơn của chính mình
  @Get('user')
  @UseGuards(JwtAuthGuard)
  async findByUser(@Req() req: Request) {
    const user = req.user as { id?: string };
    if (!user?.id) throw new BadRequestException('User ID không tồn tại');
    return this.ordersService.findByUser(user.id);
  }

  // 🟢 User hủy đơn
  @Patch('user/:id/cancel')
  @UseGuards(JwtAuthGuard)
  async userCancelOrder(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { id?: string };
    if (!user?.id) throw new BadRequestException('User ID không tồn tại');
    return this.ordersService.userCancelOrder(id, user.id);
  }

  // 🟢 Admin lấy tất cả đơn
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.ordersService.findAll();
  }

  // 🟢 Admin lấy 1 đơn theo id
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  // 🟢 Admin cập nhật trạng thái
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  // 🟢 Admin xóa đơn
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
