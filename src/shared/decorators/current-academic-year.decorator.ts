import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentAcademicYear = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-academic-year-id'] || request.academicYearId || null;
  },
);
