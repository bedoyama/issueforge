import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/user.model';
import { AuthSession } from './auth.session';

export const roleGuard =
  (min: Role): CanActivateFn =>
  () => {
    const session = inject(AuthSession);
    const router = inject(Router);
    if (session.hasRole(min)) return true;
    return router.parseUrl('/');
  };
