import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateProductDto extends PartialType(CreateProductDto) {}
