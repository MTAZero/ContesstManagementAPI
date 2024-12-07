import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginationType } from 'src/middleware';

export const Paginate = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationType => {
    const request = ctx.switchToHttp().getRequest();
    const pagination = request.pagination;

    return pagination;
  },
);
