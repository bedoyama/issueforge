import { Role } from './user.model';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: SessionUser;
}
