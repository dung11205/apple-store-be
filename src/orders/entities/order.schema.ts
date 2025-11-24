import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ type: Array, default: [] })
  products: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;

  @Prop({ default: 'pending' }) // trạng thái: pending, shipped, delivered, cancelled
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
