import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  // user xem đơn theo phone
  @Get('user/:phone')
  async findByUser(@Param('phone') phone: string) {
    return this.ordersService.findByUser(phone);
  }

  // user hủy đơn
  @Patch('user/:id/cancel')
  async userCancelOrder(@Param('id') id: string) {
    return this.ordersService.userCancelOrder(id);
  }
}
