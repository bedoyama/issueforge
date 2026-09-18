import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSession } from './auth.session';
import { safeRedirect } from './safe-redirect';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(AuthSession);
  const router = inject(Router);
  if (session.isAuthenticated()) return true;
  return router.createUrlTree(['/login'], {
    queryParams: { redirect: safeRedirect(state.url) },
  });
};
