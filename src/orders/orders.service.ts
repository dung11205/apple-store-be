import { Injectable, NotFoundException } from '@nestjs/common';
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
          price: 0,
        },
      ],
    });
    return order.save();
  }

  async findAll(): Promise<OrderDocument[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByUser(phone: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ phone }).sort({ createdAt: -1 }).exec();
  }

  async updateStatus(id: string, status: string): Promise<OrderDocument> {
    const order = await this.findOne(id);
    order.status = status;
    return order.save();
  }

  async remove(id: string): Promise<{ deletedCount?: number }> {
    await this.findOne(id);
    return this.orderModel.deleteOne({ _id: id }).exec();
  }
}
