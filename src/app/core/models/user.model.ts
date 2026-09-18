export type Role = 'viewer' | 'member' | 'admin';

export const ROLE_RANK: Record<Role, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarHue: number;
}

export interface AdminUser extends User {
  issueCount: number;
}
