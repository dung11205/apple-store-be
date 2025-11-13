import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer'; // ✅ thêm import

export class CreateProductDto {
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number) // ✅ chuyển string -> number
  readonly price: number;

  @IsOptional()
  @IsString()
  readonly category?: string;

  @IsOptional()
  @IsArray()
  readonly images?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number) // ✅ chuyển string -> number
  readonly stock?: number;

  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
