export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    academyId?: string;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  academyId?: string;
}
