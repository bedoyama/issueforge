import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSession } from './auth.session';
import { safeRedirect } from './safe-redirect';

export const guestGuard: CanActivateFn = (route) => {
  const session = inject(AuthSession);
  const router = inject(Router);
  if (!session.isAuthenticated()) return true;
  return router.parseUrl(safeRedirect(route.queryParamMap.get('redirect')));
};
