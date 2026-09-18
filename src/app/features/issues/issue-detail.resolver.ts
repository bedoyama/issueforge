import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Issue } from '../../core/models/issue.model';

export const issueResolver: ResolveFn<Issue | RedirectCommand> = (route) => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const id = route.paramMap.get('issueId')!;
  return http.get<Issue>(`/api/issues/${id}`).pipe(
    catchError(() => of(new RedirectCommand(router.parseUrl('/not-found')))),
  );
};
