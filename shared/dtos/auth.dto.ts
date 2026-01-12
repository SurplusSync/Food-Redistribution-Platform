export interface RegisterDto {
  email: string;
  password: string;
  phoneNumber?: string;
  name: string;
  role: 'DONOR' | 'NGO' | 'VOLUNTEER';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}