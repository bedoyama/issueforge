import { Routes } from '@angular/router';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./project-list.page').then((m) => m.ProjectListPage),
  },
  {
    path: ':projectId',
    loadChildren: () => import('../issues/issues.routes').then((m) => m.ISSUES_ROUTES),
  },
];
