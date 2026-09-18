import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Issue } from '../../core/models/issue.model';

@Component({
  selector: 'forge-issue-deep-link',
  template: `<p>Opening issue…</p>`,
})
export class IssueDeepLinkPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly go = this.route.data.pipe(takeUntilDestroyed()).subscribe((d) => {
    const issue = d['issue'] as Issue | undefined;
    if (issue) {
      void this.router.navigate(['/projects', issue.projectId, 'issues', issue.id, 'comments']);
    }
  });
}
