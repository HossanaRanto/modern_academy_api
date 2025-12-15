import { Gender } from '../../../entities/student.entity';
import { InscriptionStatus } from '../../../entities/student-inscription.entity';

// Student interfaces
export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  registrationNumber: string;
  dateOfBirth: Date;
  placeOfBirth?: string;
  gender: Gender;
  photo?: string;
  address?: string;
  phone?: string;
  email?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
}

export interface UpdateStudentRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  placeOfBirth?: string;
  gender?: Gender;
  photo?: string;
  address?: string;
  phone?: string;
  email?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  isActive?: boolean;
}

export interface StudentResponse {
  id: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  dateOfBirth: Date;
  placeOfBirth?: string;
  gender: Gender;
  photo?: string;
  address?: string;
  phone?: string;
  email?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Student Inscription interfaces
export interface RegisterStudentRequest {
  // Student info (for new students or updates)
  firstName: string;
  lastName: string;
  registrationNumber: string;
  dateOfBirth: Date;
  placeOfBirth?: string;
  gender: Gender;
  photo?: string;
  address?: string;
  phone?: string;
  email?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  
  // Inscription info
  classYearId: string;
  inscriptionDate: Date;
  tuitionFee?: number;
  notes?: string;
}

export interface CreateInscriptionRequest {
  studentId: string;
  classYearId: string;
  inscriptionDate: Date;
  status?: InscriptionStatus;
  tuitionFee?: number;
  isPaid?: boolean;
  notes?: string;
}

export interface UpdateInscriptionRequest {
  status?: InscriptionStatus;
  tuitionFee?: number;
  isPaid?: boolean;
  notes?: string;
}

export interface InscriptionResponse {
  id: string;
  studentId: string;
  academicYearId: string;
  classYearId: string;
  inscriptionDate: Date;
  status: InscriptionStatus;
  tuitionFee?: number;
  isPaid: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  student?: StudentResponse;
  className?: string;
  academicYearName?: string;
}

export interface RegisterStudentResponse {
  student: StudentResponse;
  inscription: InscriptionResponse;
  isNewStudent: boolean;
}

