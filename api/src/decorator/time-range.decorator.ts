import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TimeRange = createParamDecorator(
  (
    data: unknown,
    ctx: ExecutionContext,
  ): { startTime: number; endTime: number } => {
    const request = ctx.switchToHttp().getRequest();
    let startTime = 0,
      endTime = new Date().getTime();

    try {
      if (request.query.start_time)
        startTime = parseInt(request.query.start_time);
      if (request.query.end_time) endTime = parseInt(request.query.start_time);
    } catch {}

    return { startTime, endTime };
  },
);
