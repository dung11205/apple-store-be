import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  readonly price: number;

  order?: number;

  // ✅ Bắt buộc có category
  @IsString()
  readonly category: string;

  @IsOptional()
  @IsArray()
  readonly images?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  readonly stock?: number;

  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
