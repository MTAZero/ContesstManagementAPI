import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

@Injectable()
export class SortMiddleware implements NestMiddleware {
  async use(req: any, res: any, next: NextFunction) {
    const sort = req.query.sort ? req.query.sort : {};
    const ans: any = {};

    let ok = 0;
    for (const key in sort) {
      if (sort[key] == 'des') {
        ans[key] = -1;
        ok = 1;
      }
      if (sort[key] == 'asc') {
        ans[key] = 1;
        ok = 1;
      }
    }

    if (ok) req.sort = ans;

    return next();
  }
}
