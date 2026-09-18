import { httpResource } from '@angular/common/http';
import { Component } from '@angular/core';
import { AdminUser } from '../../core/models/user.model';
import { Badge } from '../../shared/ui/badge.component';
import { EmptyState } from '../../shared/ui/empty-state.component';
import { Spinner } from '../../shared/ui/spinner.component';

@Component({
  selector: 'forge-users-page',
  imports: [Badge, EmptyState, Spinner],
  templateUrl: './users.page.html',
  styleUrl: './users.page.css',
})
export class UsersPage {
  readonly users = httpResource<AdminUser[]>(() => '/api/admin/users');
}
