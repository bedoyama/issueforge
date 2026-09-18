import { Component, input } from '@angular/core';

@Component({
  selector: 'forge-empty-state',
  template: `
    <div>
      <strong>{{ title() }}</strong>
      <p>{{ message() }}</p>
      <ng-content />
    </div>
  `,
  styles: `
    div {
      padding: var(--space-8);
      text-align: center;
      color: var(--text-muted);
      border: 1px dashed var(--border);
      border-radius: var(--radius);
    }
    strong { display: block; color: var(--text); margin-bottom: var(--space-2); }
  `,
})
export class EmptyState {
  readonly title = input('Nothing here');
  readonly message = input('');
}
