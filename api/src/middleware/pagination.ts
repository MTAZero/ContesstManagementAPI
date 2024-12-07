import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from 'src/const';

export type PaginationType = {
  page: number;
  limit: number;
  skip: number;
};

@Injectable()
export class PaginationMiddleware implements NestMiddleware {
  // logger = new Logger();

  async use(req: any, res: any, next: NextFunction) {
    const pageSize = req.query.pageSize
      ? req.query.pageSize
      : DEFAULT_PAGE_SIZE;
    const pageIndex = req.query.pageIndex
      ? req.query.pageIndex
      : DEFAULT_PAGE_INDEX;

    const page = parseInt(pageIndex.toString());
    const limit = parseInt(pageSize.toString());
    const skip = limit * (page - 1);

    const pagination: PaginationType = {
      page,
      skip,
      limit,
    };

    req.pagination = pagination;

    return next();
  }
}
