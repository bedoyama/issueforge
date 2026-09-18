import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthSession } from '../auth/auth.session';
import { ToastService } from '../../shared/ui/toast.service';
import { ApiErrorBody } from '../models/api.model';
import { SKIP_ERROR_TOAST } from './api.tokens';

export const errorToastInterceptor: HttpInterceptorFn = (req, next) => {
  const toasts = inject(ToastService);
  const session = inject(AuthSession);
  const router = inject(Router);

  return next(req).pipe(
    tap({
      error: (err: unknown) => {
        if (!(err instanceof HttpErrorResponse)) return;
        const login = req.method === 'POST' && req.url.startsWith('/api/auth/login');
        if (!req.context.get(SKIP_ERROR_TOAST)) {
          const body = err.error as ApiErrorBody | undefined;
          toasts.show(body?.message ?? `Request failed (${err.status})`);
        }
        if (err.status === 401 && !login) {
          session.clear();
          void router.navigateByUrl('/login');
        }
      },
    }),
  );
};
