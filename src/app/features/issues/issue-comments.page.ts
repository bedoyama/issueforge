import { httpResource } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { AuthSession } from '../../core/auth/auth.session';
import { ClockService } from '../../core/clock/clock.service';
import { IssueComment } from '../../core/models/comment.model';
import { User } from '../../core/models/user.model';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { EmptyState } from '../../shared/ui/empty-state.component';
import { IssueService } from './issue.service';

@Component({
  selector: 'forge-issue-comments',
  imports: [FormsModule, TimeAgoPipe, EmptyState],
  templateUrl: './issue-comments.page.html',
  styleUrl: './issue-comments.page.css',
})
export class IssueCommentsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(IssueService);
  readonly session = inject(AuthSession);
  readonly clock = inject(ClockService);

  readonly issueId = toSignal(
    this.route.parent!.paramMap.pipe(map((p) => p.get('issueId'))),
    { initialValue: this.route.parent!.snapshot.paramMap.get('issueId') },
  );

  readonly comments = httpResource<IssueComment[]>(() => {
    const id = this.issueId();
    return id ? `/api/issues/${id}/comments` : undefined;
  });

  readonly users = httpResource<User[]>(() => '/api/users');
  draft = '';

  author(id: string): string {
    return this.users.value()?.find((u) => u.id === id)?.name ?? id;
  }

  post(): void {
    const id = this.issueId();
    const body = this.draft.trim();
    if (!id || !body) return;
    this.api.addComment(id, body).subscribe(() => {
      this.draft = '';
      this.comments.reload();
    });
  }
}
