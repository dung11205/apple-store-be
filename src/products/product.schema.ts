import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  // ✅ category luôn lưu lowercase
  @Prop({
    set: (val: string) => val?.toLowerCase().trim(),
  })
  category: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: 0 })
  stock: number;

  @Prop({ default: true })
  isActive: boolean; // mặc định true

  @Prop({ default: 0 })
  order: number; // thứ tự hiển thị
}

export const ProductSchema = SchemaFactory.createForClass(Product);
