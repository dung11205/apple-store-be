import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

interface ProductQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}

  // 🟢 Tạo mới sản phẩm
  async create(
    data: CreateProductDto & { images?: string[] },
  ): Promise<Product> {
    const productData = {
      ...data,
      price: Number(data.price),
      stock: data.stock ? Number(data.stock) : 0,
      images: data.images || [],
      order: data.order ?? 0,
    };

    const product = new this.productModel(productData);
    return product.save();
  }

  // 🟡 Lấy danh sách sản phẩm
  async findAll(
    query: ProductQuery,
  ): Promise<{ data: Product[]; total: number }> {
    const {
      page = 1,
      limit = 100,
      keyword = '',
      category,
      minPrice,
      maxPrice,
      sortBy = 'order',
      order = 'asc',
    } = query;

    const filters: Record<string, any> = {};
    if (keyword) filters.name = { $regex: keyword, $options: 'i' };
    if (category) filters.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.price = {
        ...(minPrice !== undefined ? { $gte: Number(minPrice) } : {}),
        ...(maxPrice !== undefined ? { $lte: Number(maxPrice) } : {}),
      };
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.productModel
        .find(filters)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .exec(),
      this.productModel.countDocuments(filters),
    ]);

    return { data, total };
  }

  // 🔵 Lấy chi tiết sản phẩm
  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  // 🟠 Cập nhật sản phẩm
  async update(
    id: string,
    data: UpdateProductDto & { order?: number },
  ): Promise<Product> {
    const updated = await this.productModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException(`Product with ID ${id} not found`);
    return updated;
  }

  // 🔴 Xóa sản phẩm
  async delete(id: string): Promise<{ message: string }> {
    const deleted = await this.productModel.findByIdAndDelete(id).exec();
    if (!deleted)
      throw new NotFoundException(`Product with ID ${id} not found`);
    return { message: 'Product deleted successfully' };
  }

  // 🔹 Cập nhật thứ tự nhiều sản phẩm (Drag & Drop)
  async reorderProducts(productIds: string[]): Promise<{ message: string }> {
    for (let i = 0; i < productIds.length; i++) {
      await this.update(productIds[i], { order: i });
    }
    return { message: 'Sắp xếp sản phẩm thành công' };
  }
}
