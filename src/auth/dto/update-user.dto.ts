import { IsEmail, IsOptional, IsString, IsEnum } from 'class-validator';
import { UserRole } from './user-role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
