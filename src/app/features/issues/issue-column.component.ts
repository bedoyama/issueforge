import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, input, output } from '@angular/core';
import { Issue, IssueStatus, Label } from '../../core/models/issue.model';
import { User } from '../../core/models/user.model';
import { StatusLabelPipe } from '../../shared/pipes/status-label.pipe';
import { IssueCard } from './issue-card.component';

@Component({
  selector: 'forge-issue-column',
  imports: [IssueCard, StatusLabelPipe, CdkDropList],
  template: `
    <section [attr.data-status]="status()">
      <h2>{{ status() | statusLabel }} <span>{{ issues().length }}</span></h2>
      <div
        cdkDropList
        [cdkDropListData]="issues()"
        (cdkDropListDropped)="onDrop($event)"
      >
        @for (issue of issues(); track issue.id) {
          <forge-issue-card
            [issue]="issue"
            [projectKey]="projectKey()"
            [query]="query()"
            [usersById]="usersById()"
            [labelsById]="labelsById()"
            (open)="open.emit($event)"
            (move)="move.emit({ id: issue.id, status: $event })"
          />
        } @empty {
          <p>No issues</p>
        }
      </div>
    </section>
  `,
  styles: `
    section { background: var(--bg-elev); border: 1px solid var(--border); border-radius: 12px; padding: 12px; min-height: 200px; }
    h2 { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 10px; }
    div { display: grid; gap: 8px; }
    p { color: var(--text-muted); font-size: 13px; }
    section[data-status='todo'] h2 { color: var(--status-todo); }
    section[data-status='in_progress'] h2 { color: var(--status-in-progress); }
    section[data-status='in_review'] h2 { color: var(--status-in-review); }
    section[data-status='done'] h2 { color: var(--status-done); }
  `,
})
export class IssueColumn {
  readonly status = input.required<IssueStatus>();
  readonly issues = input<Issue[]>([]);
  readonly projectKey = input('IF');
  readonly query = input('');
  readonly usersById = input<Record<string, User>>({});
  readonly labelsById = input<Record<string, Label>>({});
  readonly open = output<string>();
  readonly move = output<{ id: string; status: IssueStatus }>();

  onDrop(event: CdkDragDrop<Issue[]>): void {
    if (event.previousContainer === event.container) return;
    const issue = event.item.data as Issue;
    this.move.emit({ id: issue.id, status: this.status() });
  }
}
