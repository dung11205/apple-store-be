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
  Headers,
  ForbiddenException,
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
  // 🔹 Reorder sản phẩm (Admin)
  @Put('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async reorderProducts(@Body() body: { productIds: string[] }) {
    const { productIds } = body;

    for (let i = 0; i < productIds.length; i++) {
      await this.productsService.update(productIds[i], { order: i });
    }

    return { success: true, message: 'Sắp xếp sản phẩm thành công' };
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

  // 🔹 API riêng cho /store
  @Get('store')
  async getProductsForStore(@Headers('x-api-key') apiKey: string) {
    // Kiểm tra api key (bảo mật cho frontend store)
    if (apiKey !== process.env.STORE_API_KEY) {
      throw new ForbiddenException('Access denied');
    }

    // Lấy tất cả sản phẩm active, không phân trang
    const { data } = await this.productsService.findAll({
      page: 1,
      limit: 1000, // hoặc số lượng tối đa bạn muốn
    });

    // Bạn có thể lọc chỉ lấy sản phẩm isActive = true
    const activeProducts = data.filter((p) => p.isActive);

    return activeProducts;
  }
}
