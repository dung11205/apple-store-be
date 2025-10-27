import { IsEmail, IsString, MinLength } from 'class-validator'; // Thêm MinLength cho password

export class LoginDto {
  @IsEmail({}, { message: 'Email phải hợp lệ' })
  email: string;

  @IsString({ message: 'Password phải là string' })
  @MinLength(6, { message: 'Password phải ít nhất 6 ký tự' }) // Fix: Thêm min length để bảo mật
  password: string;
}
