import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  Delete,
  Put,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { Product } from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 🧑‍💼 Admin thêm sản phẩm
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${uuidv4()}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        const mimeOk = allowed.test(file.mimetype);
        const extOk = allowed.test(
          path.extname(file.originalname).toLowerCase(),
        );
        cb(null, mimeOk && extOk);
      },
    }),
  )
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() data: CreateProductDto,
  ): Promise<Product> {
    const imageUrls =
      files?.map((file) => `/uploads/products/${file.filename}`) || [];
    return this.productsService.create({ ...data, images: imageUrls });
  }

  // 🔹 Lấy danh sách sản phẩm (public)
  @Get()
  async findAll(@Query() query): Promise<{ data: Product[]; total: number }> {
    return this.productsService.findAll(query);
  }

  // 🔹 Lấy chi tiết sản phẩm
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  // 🟠 Cập nhật sản phẩm (Admin)
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, data);
  }

  // 🗑 Xóa sản phẩm (Admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.productsService.delete(id); // trả về { message: 'Product deleted successfully' }
  }
}
