import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

// Fix: Define interface cho payload để tránh any (strict type sub, email, role)
interface JwtPayload {
  sub: string; // MongoDB _id
  email: string;
  role: string; // 'user' | 'admin'
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback_secret',
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    // Fix: Type payload là JwtPayload, return Promise<any> (chuẩn Passport)
    // Fix: Giờ payload.sub là string (không any), call an toàn
    const user = await this.authService.validateUserById(payload.sub);
    if (!user) return null;

    // Fix: Type guard sau if (!user) → user là User (không any), assign an toàn
    // Return full user info, gắn vào req.user (thêm name nếu schema có)
    return {
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name, // Nếu schema không có name, xóa dòng này
    };
  }
}
