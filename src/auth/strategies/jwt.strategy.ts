import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Types } from 'mongoose'; // ✅ Thêm dòng này

// ✅ Interface cho payload (type-safe)
interface JwtPayload {
  sub: string; // MongoDB _id
  email: string;
  role: 'user' | 'admin'; // strict type để RolesGuard hoạt động an toàn
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback_secret',
    });
  }

  // ✅ Hàm validate được Passport tự gọi sau khi verify token
  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUserById(payload.sub);

    if (!user) {
      // Nếu user bị xóa hoặc không tồn tại → báo lỗi rõ ràng
      throw new UnauthorizedException('User not found or inactive');
    }

    // 🟢 Fix: Ép kiểu an toàn để tránh lỗi ESLint/TypeScript
    const userId =
      user._id instanceof Types.ObjectId
        ? user._id.toString()
        : String(user._id);

    // ✅ Return object này sẽ được gắn vào req.user
    return {
      userId,
      email: user.email,
      role: user.role,
      name: user.name ?? null, // Nếu schema có name
    };
  }
}
