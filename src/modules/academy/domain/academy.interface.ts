export interface CreateAcademyRequest {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface AcademyResponse {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
