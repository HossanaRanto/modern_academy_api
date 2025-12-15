export interface CreateClassRequest {
  name: string;
  code: string;
  level: number;
  description?: string;
  capacity?: number;
  childClassId?: string;
}

export interface UpdateClassRequest {
  name?: string;
  code?: string;
  level?: number;
  description?: string;
  capacity?: number;
  isActive?: boolean;
  childClassId?: string;
}

export interface ClassResponse {
  id: string;
  name: string;
  code: string;
  level: number;
  description?: string;
  capacity?: number;
  isActive: boolean;
  childClassId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassYearResponse {
  id: string;
  classId: string;
  academicYearId: string;
  section?: string;
  roomNumber?: string;
  maxStudents?: number;
  isActive: boolean;
  class?: ClassResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClassYearRequest {
  classId: string;
  section?: string;
  roomNumber?: string;
  maxStudents?: number;
}

export interface UpdateClassYearRequest {
  section?: string;
  roomNumber?: string;
  maxStudents?: number;
  isActive?: boolean;
}
