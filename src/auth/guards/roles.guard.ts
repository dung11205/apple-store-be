import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express'; // Fix: Import Request từ express để extend

// Fix: Extend Request với user field để type-safe (thay vì interface riêng)
interface RequestWithUser extends Request {
  user?: {
    userId: string;
    role: string; // Hoặc 'user' | 'admin' nếu muốn strict type
    // Thêm fields khác nếu cần: email, name,...
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    // Fix: Dùng generic getRequest<RequestWithUser>() thay vì 'as' để tránh unnecessary assertion
    // NestJS hỗ trợ generic này để type-safe req.user
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Giữ nguyên: Kiểm tra user tồn tại và có role để tránh runtime error
    if (!user || !user.role) {
      return false; // Hoặc throw new ForbiddenException('Access denied') nếu muốn HTTP 403
    }

    // Giữ nguyên: Dùng some() cho multiple roles (ví dụ @Roles('admin', 'moderator'))
    return requiredRoles.some((role) => user.role === role);
  }
}
