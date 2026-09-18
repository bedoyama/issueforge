import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthSession } from './auth.session';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(AuthSession);
  if (req.method === 'POST' && req.url.startsWith('/api/auth/login')) return next(req);
  const token = session.token();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
