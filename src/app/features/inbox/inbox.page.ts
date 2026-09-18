import { httpResource } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClockService } from '../../core/clock/clock.service';
import { User } from '../../core/models/user.model';
import { NotificationsService } from '../../core/notifications/notifications.service';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { EmptyState } from '../../shared/ui/empty-state.component';

@Component({
  selector: 'forge-inbox',
  imports: [RouterLink, TimeAgoPipe, EmptyState],
  templateUrl: './inbox.page.html',
  styleUrl: './inbox.page.css',
})
export class InboxPage {
  readonly notes = inject(NotificationsService);
  readonly clock = inject(ClockService);
  readonly users = httpResource<User[]>(() => '/api/users');

  actor(id: string): string {
    return this.users.value()?.find((u) => u.id === id)?.name ?? id;
  }

  mark(id: string): void {
    this.notes.markRead(id).subscribe();
  }
}
