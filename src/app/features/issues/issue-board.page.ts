import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { httpResource } from '@angular/common/http';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthSession } from '../../core/auth/auth.session';
import { ListResponse } from '../../core/models/api.model';
import {
  BoardFilterSlice,
  EMPTY_BOARD_FILTERS,
  ISSUE_STATUSES,
  Issue,
  IssueStatus,
  Label,
} from '../../core/models/issue.model';
import { Project } from '../../core/models/project.model';
import { User } from '../../core/models/user.model';
import { PrefsService } from '../../core/prefs/prefs.service';
import { EmptyState } from '../../shared/ui/empty-state.component';
import { Spinner } from '../../shared/ui/spinner.component';
import { IssueColumn } from './issue-column.component';
import { IssueFilters } from './issue-filters.component';
import { IssueSearch } from './issue-search.component';
import { IssueService } from './issue.service';

@Component({
  selector: 'forge-issue-board',
  imports: [IssueColumn, IssueFilters, IssueSearch, Spinner, EmptyState, CdkDropListGroup],
  templateUrl: './issue-board.page.html',
  styleUrl: './issue-board.page.css',
})
export class IssueBoardPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly prefs = inject(PrefsService);
  private readonly issuesApi = inject(IssueService);
  readonly session = inject(AuthSession);

  readonly projectId = toSignal(this.route.paramMap.pipe(map((p) => p.get('projectId'))), {
    initialValue: this.route.snapshot.paramMap.get('projectId'),
  });

  /**
   * Teaching beat: when projectId changes, recompute.
   * - project missing from the prefs map (first visit) → EMPTY_BOARD_FILTERS (reset).
   * - project already in the map → restore that slice.
   */
  readonly filters = linkedSignal<string | null, BoardFilterSlice>({
    source: this.projectId,
    computation: (id) => {
      if (!id) return EMPTY_BOARD_FILTERS;
      return this.prefs.boardFilters()[id] ?? EMPTY_BOARD_FILTERS;
    },
  });

  readonly issues = httpResource<ListResponse<Issue>>(() => {
    const projectId = this.projectId();
    if (!projectId) return undefined;
    const f = this.filters();
    return {
      url: '/api/issues',
      params: {
        projectId,
        q: f.query,
        status: f.status ?? '',
        assigneeId: f.assigneeId ?? '',
        page: '1',
        pageSize: '100',
      },
    };
  });

  readonly project = httpResource<Project>(() => {
    const id = this.projectId();
    return id ? `/api/projects/${id}` : undefined;
  });

  readonly users = httpResource<User[]>(() => '/api/users');
  readonly labels = httpResource<Label[]>(() => '/api/labels');

  readonly usersById = computed(() => Object.fromEntries((this.users.value() ?? []).map((u) => [u.id, u])));
  readonly labelsById = computed(() => Object.fromEntries((this.labels.value() ?? []).map((l) => [l.id, l])));

  readonly columns = computed(() => {
    const items = this.issues.hasValue() ? this.issues.value().items : [];
    return ISSUE_STATUSES.map((status) => ({
      status,
      issues: items.filter((i) => i.status === status),
    }));
  });

  onFiltersChange(slice: BoardFilterSlice): void {
    this.filters.set(slice);
    const id = this.projectId();
    if (id) this.prefs.patchBoardFilters(id, slice);
  }

  onSearch(term: string): void {
    this.onFiltersChange({ ...this.filters(), query: term });
  }

  onStatus(status: IssueStatus | null): void {
    this.onFiltersChange({ ...this.filters(), status });
  }

  onAssignee(assigneeId: string | null): void {
    this.onFiltersChange({ ...this.filters(), assigneeId });
  }

  openIssue(id: string): void {
    const projectId = this.projectId();
    if (!projectId) return;
    void this.router.navigate(['/projects', projectId, 'issues', id]);
  }

  moveIssue(event: { id: string; status: IssueStatus }): void {
    this.issuesApi.patch(event.id, { status: event.status }).subscribe(() => this.issues.reload());
  }

  newIssue(): void {
    void this.router.navigate(['/projects', this.projectId(), 'issues', 'new']);
  }
}
