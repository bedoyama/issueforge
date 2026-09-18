import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { roleGuard } from './core/auth/role.guard';
import { issueResolver } from './features/issues/issue-detail.resolver';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'projects' },
      {
        path: 'projects',
        loadChildren: () => import('./features/projects/projects.routes').then((m) => m.PROJECTS_ROUTES),
      },
      {
        path: 'inbox',
        loadChildren: () => import('./features/inbox/inbox.routes').then((m) => m.INBOX_ROUTES),
      },
      {
        path: 'admin',
        canActivate: [roleGuard('admin')],
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: 'issues/:issueId',
        resolve: { issue: issueResolver },
        loadComponent: () =>
          import('./features/issues/issue-deep-link.page').then((m) => m.IssueDeepLinkPage),
      },
      {
        path: 'not-found',
        loadComponent: () => import('./layout/not-found.page').then((m) => m.NotFoundPage),
      },
      {
        path: '**',
        loadComponent: () => import('./layout/not-found.page').then((m) => m.NotFoundPage),
      },
    ],
  },
];
