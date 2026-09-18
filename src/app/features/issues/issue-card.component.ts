import { CdkDrag } from '@angular/cdk/drag-drop';
import { Component, inject, input, output } from '@angular/core';
import { AuthSession } from '../../core/auth/auth.session';
import { ClockService } from '../../core/clock/clock.service';
import { ISSUE_STATUSES, Issue, IssueStatus, Label } from '../../core/models/issue.model';
import { User } from '../../core/models/user.model';
import { HighlightQuery } from '../../shared/directives/highlight-query.directive';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { StatusLabelPipe } from '../../shared/pipes/status-label.pipe';
import { Avatar } from '../../shared/ui/avatar.component';
import { Badge } from '../../shared/ui/badge.component';

@Component({
  selector: 'forge-issue-card',
  imports: [Avatar, Badge, TimeAgoPipe, StatusLabelPipe, HighlightQuery, CdkDrag],
  template: `
    <article cdkDrag [cdkDragData]="issue()" [cdkDragDisabled]="!canMove()" (click)="open.emit(issue().id)">
      <header>
        <span class="key">{{ key() }}-{{ issue().number }}</span>
        <span>{{ issue().createdAt | timeAgo: clock.now() }}</span>
      </header>
      <h3 [highlightQuery]="query()" [text]="issue().title"></h3>
      <footer>
        <forge-badge [tone]="'var(--status-' + issue().status.replace('_', '-') + ')'">
          {{ issue().status | statusLabel }}
        </forge-badge>
        @for (lab of labels(); track lab.id) {
          <forge-badge [tone]="lab.color">{{ lab.name }}</forge-badge>
        }
        @if (assignee(); as u) {
          <forge-avatar [name]="u.name" [hue]="u.avatarHue" />
        }
      </footer>
      @if (canMove()) {
        <select (click)="$event.stopPropagation()" (change)="onStatus($event)">
          @for (s of statuses; track s) {
            <option [value]="s" [selected]="s === issue().status">{{ s | statusLabel }}</option>
          }
        </select>
      }
    </article>
  `,
  styles: `
    article { display: grid; gap: 8px; padding: 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 10px; cursor: pointer; }
    header { display: flex; justify-content: space-between; color: var(--text-muted); font-size: 12px; }
    footer { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
    h3 { font-size: 14px; }
    select { background: var(--bg-elev); color: var(--text); border: 1px solid var(--border); border-radius: 6px; }
    :host ::ng-deep mark { background: #fbbf24; color: #111; border-radius: 2px; }
  `,
})
export class IssueCard {
  readonly issue = input.required<Issue>();
  readonly projectKey = input('IF');
  readonly query = input('');
  readonly usersById = input<Record<string, User>>({});
  readonly labelsById = input<Record<string, Label>>({});
  readonly open = output<string>();
  readonly move = output<IssueStatus>();
  readonly clock = inject(ClockService);
  private readonly session = inject(AuthSession);
  readonly statuses = ISSUE_STATUSES;
  readonly key = () => this.projectKey();
  readonly assignee = () => {
    const id = this.issue().assigneeId;
    return id ? this.usersById()[id] : null;
  };
  readonly labels = () => this.issue().labelIds.map((id) => this.labelsById()[id]).filter(Boolean);
  readonly canMove = () => this.session.hasRole('member');

  onStatus(event: Event): void {
    this.move.emit((event.target as HTMLSelectElement).value as IssueStatus);
  }
}
