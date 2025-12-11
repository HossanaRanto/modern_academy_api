export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
}

export interface UpdateStudentRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
}

export interface StudentResponse {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Note: Students are linked to academies through inscriptions
  inscriptions?: Array<{
    id: string;
    academicYearId: string;
    status: string;
  }>;
}
