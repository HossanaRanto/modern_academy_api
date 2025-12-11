import { SetMetadata } from '@nestjs/common';

export const ACADEMIC_YEAR_REQUIRED_KEY = 'academicYearRequired';
export const RequireAcademicYear = () => SetMetadata(ACADEMIC_YEAR_REQUIRED_KEY, true);
