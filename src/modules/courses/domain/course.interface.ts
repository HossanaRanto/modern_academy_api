export interface CreateCourseRequest {
  name: string;
  code: string;
  description?: string;
  coefficient?: number;
  category?: string;
}

export interface UpdateCourseRequest {
  name?: string;
  code?: string;
  description?: string;
  coefficient?: number;
  category?: string;
  isActive?: boolean;
}

export interface CourseResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
  coefficient?: number;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseClassResponse {
  id: string;
  courseId: string;
  classYearId: string;
  teacherId?: string;
  hoursPerWeek?: number;
  coefficient: number;
  isActive: boolean;
  course?: CourseResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseClassRequest {
  courseId: string;
  classYearId: string;
  teacherId?: string;
  hoursPerWeek?: number;
  coefficient?: number;
}

export interface UpdateCourseClassRequest {
  teacherId?: string;
  hoursPerWeek?: number;
  coefficient?: number;
  isActive?: boolean;
}
