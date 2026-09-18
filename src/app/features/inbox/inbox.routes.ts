import { Routes } from '@angular/router';

export const INBOX_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./inbox.page').then((m) => m.InboxPage),
  },
];
