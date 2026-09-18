import { httpResource } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { DirtyAware } from '../../core/auth/unsaved-changes.guard';
import { CreateIssueRequest } from '../../core/models/api.model';
import { ISSUE_PRIORITIES, ISSUE_STATUSES, Issue, Label } from '../../core/models/issue.model';
import { User } from '../../core/models/user.model';
import { Button } from '../../shared/ui/button.component';
import { TextField } from '../../shared/ui/text-field.component';
import { IssueService } from './issue.service';

@Component({
  selector: 'forge-issue-form',
  imports: [ReactiveFormsModule, Button, TextField],
  templateUrl: './issue-form.page.html',
  styleUrl: './issue-form.page.css',
})
export class IssueFormPage implements DirtyAware {
  private readonly api = inject(IssueService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly projectId = toSignal(this.route.parent!.paramMap.pipe(map((p) => p.get('projectId'))), {
    initialValue: this.route.parent?.snapshot.paramMap.get('projectId') ?? null,
  });
  readonly issueId = toSignal(this.route.paramMap.pipe(map((p) => p.get('issueId'))), {
    initialValue: this.route.snapshot.paramMap.get('issueId'),
  });

  readonly labels = httpResource<Label[]>(() => '/api/labels');
  readonly users = httpResource<User[]>(() => '/api/users');
  readonly existing = httpResource<Issue>(() => {
    const id = this.issueId();
    return id ? `/api/issues/${id}` : undefined;
  });

  readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(120)],
    }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(4000)] }),
    status: new FormControl<(typeof ISSUE_STATUSES)[number]>('todo', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    priority: new FormControl<(typeof ISSUE_PRIORITIES)[number]>('medium', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    assigneeId: new FormControl<string | null>(null),
    labelIds: new FormControl<string[]>([], { nonNullable: true }),
  });

  readonly statuses = ISSUE_STATUSES;
  readonly priorities = ISSUE_PRIORITIES;
  readonly editing = computed(() => !!this.issueId());
  private snapshot = this.form.getRawValue();
  private filled = false;
  private readonly hydrate = toObservable(computed(() => (this.existing.hasValue() ? this.existing.value() : null)))
    .pipe(
      filter((issue): issue is Issue => !!issue && !this.filled),
      takeUntilDestroyed(),
    )
    .subscribe((issue) => {
      this.form.setValue({
        title: issue.title,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        assigneeId: issue.assigneeId,
        labelIds: issue.labelIds,
      });
      this.snapshot = this.form.getRawValue();
      this.filled = true;
    });

  isDirty(): boolean {
    return JSON.stringify(this.form.getRawValue()) !== JSON.stringify(this.snapshot);
  }

  toggleLabel(id: string, checked: boolean): void {
    const current = this.form.controls.labelIds.value;
    this.form.controls.labelIds.setValue(checked ? [...current, id] : current.filter((x) => x !== id));
  }

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const projectId = this.projectId();
    if (!projectId) return;
    const body: CreateIssueRequest = {
      projectId,
      title: value.title,
      description: value.description,
      status: value.status,
      priority: value.priority,
      assigneeId: value.assigneeId || null,
      labelIds: value.labelIds,
    };
    const id = this.issueId();
    const req = id ? this.api.patch(id, body) : this.api.create(body);
    req.subscribe((issue) => {
      this.form.markAsPristine();
      this.snapshot = this.form.getRawValue();
      void this.router.navigate(['/projects', issue.projectId, 'issues', issue.id, 'comments']);
    });
  }
}
