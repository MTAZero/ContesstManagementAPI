import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/modules/database/schemas/users.schema';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest();
    return request.user; // Giả sử thông tin người dùng được lưu trong request.user
  },
);
