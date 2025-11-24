import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './entities/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  // Tạo đơn mới (user)
  async create(
    createOrderDto: CreateOrderDto,
    userId: string,
  ): Promise<OrderDocument> {
    const order = new this.orderModel({
      userId,
      name: createOrderDto.name,
      phone: createOrderDto.phone,
      address: createOrderDto.address,
      products: [
        {
          productId: createOrderDto.productId,
          name: createOrderDto.productName,
          quantity: createOrderDto.quantity,
          price: createOrderDto.price,
        },
      ],
      status: 'pending',
    });
    return order.save();
  }

  // Lấy đơn của user
  async findByUser(userId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  // User hủy đơn
  async userCancelOrder(id: string, userId: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    if (order.userId !== userId)
      throw new ForbiddenException('Không có quyền hủy đơn này');
    if (['shipped', 'delivered'].includes(order.status))
      throw new BadRequestException('Đơn hàng đã được giao, không thể hủy.');
    if (order.status === 'cancelled')
      throw new BadRequestException('Đơn hàng đã bị hủy.');

    order.status = 'cancelled';
    return order.save();
  }

  // Admin
  async findAll(): Promise<OrderDocument[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: string): Promise<OrderDocument> {
    const allowedStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status))
      throw new BadRequestException(
        `Status không hợp lệ: ${allowedStatuses.join(', ')}`,
      );
    const order = await this.findOne(id);
    order.status = status;
    return order.save();
  }

  async remove(id: string): Promise<{ deletedCount?: number }> {
    await this.findOne(id);
    return this.orderModel.deleteOne({ _id: id }).exec();
  }
}
