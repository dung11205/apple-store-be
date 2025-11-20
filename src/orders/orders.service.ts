import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './entities/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
  ) {}

  // Tạo đơn hàng mới (user)
  async create(createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    const order = new this.orderModel({
      name: createOrderDto.name,
      phone: createOrderDto.phone,
      address: createOrderDto.address,
      products: [
        {
          productId: createOrderDto.productId,
          name: createOrderDto.productName,
          quantity: createOrderDto.quantity,
          price: 0, // có thể cập nhật giá sau
        },
      ],
      status: 'pending', // mặc định trạng thái
    });
    return order.save();
  }

  // Lấy tất cả đơn (admin)
  async findAll(): Promise<OrderDocument[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  // Lấy 1 đơn theo id
  async findOne(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // Lấy đơn của 1 user theo số điện thoại
  async findByUser(phone: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ phone }).sort({ createdAt: -1 }).exec();
  }

  // Admin cập nhật trạng thái
  async updateStatus(id: string, status: string): Promise<OrderDocument> {
    const allowedStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(
        `Status không hợp lệ. Chỉ chấp nhận: ${allowedStatuses.join(', ')}`,
      );
    }

    const order = await this.findOne(id);
    order.status = status;
    return order.save();
  }

  // Admin xóa đơn
  async remove(id: string): Promise<{ deletedCount?: number }> {
    await this.findOne(id); // kiểm tra tồn tại
    return this.orderModel.deleteOne({ _id: id }).exec();
  }

  // User hủy đơn
  async userCancelOrder(id: string): Promise<OrderDocument> {
    const order = await this.findOne(id);

    if (['shipped', 'delivered'].includes(order.status)) {
      throw new BadRequestException('Đơn hàng đã được giao, không thể hủy.');
    }
    if (order.status === 'cancelled') {
      throw new BadRequestException('Đơn hàng đã bị hủy.');
    }

    order.status = 'cancelled';
    return order.save();
  }
}
