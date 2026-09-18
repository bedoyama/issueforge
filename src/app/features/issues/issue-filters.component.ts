import { HttpClient } from '@angular/common/http';
import { Component, inject, input, model, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { ISSUE_STATUSES, IssueStatus } from '../../core/models/issue.model';
import { User } from '../../core/models/user.model';
import { StatusLabelPipe } from '../../shared/pipes/status-label.pipe';

@Component({
  selector: 'forge-issue-filters',
  imports: [StatusLabelPipe],
  template: `
    <div class="chips">
      <button type="button" [class.on]="status() === null" (click)="status.set(null)">All</button>
      @for (s of statuses; track s) {
        <button type="button" [class.on]="status() === s" (click)="status.set(s)">{{ s | statusLabel }}</button>
      }
    </div>
    <label>
      Assignee
      <input placeholder="Filter by name" (input)="onTypeahead($any($event.target).value)" />
    </label>
    @if (hits().length) {
      <ul>
        @for (u of hits(); track u.id) {
          <li><button type="button" (click)="pick(u)">{{ u.name }}</button></li>
        }
        <li><button type="button" (click)="pickUnassigned()">Unassigned</button></li>
      </ul>
    }
    @if (assigneeId()) {
      <button type="button" (click)="clearAssignee()">Clear assignee</button>
    }
  `,
  styles: `
    :host { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .chips { display: flex; gap: 6px; flex-wrap: wrap; }
    button { background: var(--bg-elev); border: 1px solid var(--border); color: var(--text); border-radius: 999px; padding: 4px 10px; cursor: pointer; }
    button.on { border-color: var(--accent); color: var(--accent); }
    input { background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 6px 8px; }
    ul { list-style: none; margin: 0; padding: 8px; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 8px; }
  `,
})
export class IssueFilters {
  private readonly http = inject(HttpClient);
  readonly status = model<IssueStatus | null>(null);
  readonly assigneeId = model<string | null>(null);
  readonly users = input<User[]>([]);
  readonly assigneeChange = output<string | null>();
  readonly statuses = ISSUE_STATUSES;
  protected readonly hits = signal<User[]>([]);
  private readonly q$ = new Subject<string>();
  private readonly sub = this.q$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((q) => (q ? this.http.get<User[]>('/api/users', { params: { q } }) : of([] as User[]))),
      takeUntilDestroyed(),
    )
    .subscribe((users) => this.hits.set(users));

  onTypeahead(value: string): void {
    this.q$.next(value);
  }

  pick(user: User): void {
    this.assigneeId.set(user.id);
    this.assigneeChange.emit(user.id);
    this.hits.set([]);
  }

  pickUnassigned(): void {
    this.assigneeId.set('unassigned');
    this.assigneeChange.emit('unassigned');
    this.hits.set([]);
  }

  clearAssignee(): void {
    this.assigneeId.set(null);
    this.assigneeChange.emit(null);
  }
}
