import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { unsavedChangesGuard } from '../../core/auth/unsaved-changes.guard';
import { issueResolver } from './issue-detail.resolver';

export const ISSUES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./issue-board.page').then((m) => m.IssueBoardPage),
  },
  {
    path: 'issues/new',
    canActivate: [roleGuard('member')],
    loadComponent: () => import('./issue-form.page').then((m) => m.IssueFormPage),
  },
  {
    path: 'issues/:issueId',
    resolve: { issue: issueResolver },
    loadComponent: () => import('./issue-detail.page').then((m) => m.IssueDetailPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'comments' },
      {
        path: 'comments',
        loadComponent: () => import('./issue-comments.page').then((m) => m.IssueCommentsPage),
      },
    ],
  },
  {
    path: 'issues/:issueId/edit',
    canActivate: [roleGuard('member')],
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () => import('./issue-form.page').then((m) => m.IssueFormPage),
  },
];
