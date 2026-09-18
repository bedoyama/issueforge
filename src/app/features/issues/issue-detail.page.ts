import { httpResource } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { AuthSession } from '../../core/auth/auth.session';
import { ClockService } from '../../core/clock/clock.service';
import { Issue, Label } from '../../core/models/issue.model';
import { User } from '../../core/models/user.model';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { StatusLabelPipe } from '../../shared/pipes/status-label.pipe';
import { Badge } from '../../shared/ui/badge.component';

@Component({
  selector: 'forge-issue-detail',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TimeAgoPipe, StatusLabelPipe, Badge],
  templateUrl: './issue-detail.page.html',
  styleUrl: './issue-detail.page.css',
})
export class IssueDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly session = inject(AuthSession);
  readonly clock = inject(ClockService);

  readonly issueFromRoute = toSignal(this.route.data.pipe(map((d) => d['issue'] as Issue)));

  readonly issueId = toSignal(this.route.paramMap.pipe(map((p) => p.get('issueId'))), {
    initialValue: this.route.snapshot.paramMap.get('issueId'),
  });

  readonly issue = httpResource<Issue>(() => {
    const id = this.issueId();
    return id ? `/api/issues/${id}` : undefined;
  });

  readonly users = httpResource<User[]>(() => '/api/users');
  readonly labels = httpResource<Label[]>(() => '/api/labels');

  current(): Issue | undefined {
    return this.issue.hasValue() ? this.issue.value() : this.issueFromRoute();
  }

  userName(id: string | null): string {
    if (!id) return 'Unassigned';
    return this.users.value()?.find((u) => u.id === id)?.name ?? id;
  }

  label(id: string): Label | undefined {
    return this.labels.value()?.find((l) => l.id === id);
  }

  edit(): void {
    const issue = this.current();
    if (!issue) return;
    void this.router.navigate(['/projects', issue.projectId, 'issues', issue.id, 'edit']);
  }

  back(): void {
    const issue = this.current();
    if (!issue) return;
    void this.router.navigate(['/projects', issue.projectId]);
  }
}
