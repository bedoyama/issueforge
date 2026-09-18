import { Role } from '../models/user.model';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  exp: number;
}

function b64url(value: string): string {
  return btoa(value).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function fromB64url(value: string): string {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '==='.slice((value.length + 3) % 4);
  return atob(padded);
}

export function mintJwt(payload: Omit<JwtPayload, 'exp'>, ttlMs = 8 * 60 * 60 * 1000): string {
  const header = b64url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = b64url(JSON.stringify({ ...payload, exp: Math.floor((Date.now() + ttlMs) / 1000) }));
  return `${header}.${body}.mock-sig`;
}

export function parseJwt(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(fromB64url(parts[1])) as JwtPayload;
    if (!payload.sub || !payload.role || !payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
