import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Types } from 'mongoose';

interface JwtPayload {
  sub: string; // MongoDB _id
  email: string;
  role: 'user' | 'admin';
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

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Chuyển ObjectId sang string và trả về 'id' để controller đọc req.user.id
    const id =
      user._id instanceof Types.ObjectId
        ? user._id.toString()
        : String(user._id);

    return {
      id, // ✅ dùng 'id' thay vì 'userId'
      email: user.email,
      role: user.role,
      name: user.name ?? null,
    };
  }
}
