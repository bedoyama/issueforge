import { Component, input } from '@angular/core';

@Component({
  selector: 'forge-text-field',
  template: `
    <label>
      <span>{{ label() }}</span>
      <ng-content />
    </label>
  `,
  styles: `
    label { display: grid; gap: 6px; font-size: 13px; color: var(--text-muted); }
    :host ::ng-deep input,
    :host ::ng-deep textarea,
    :host ::ng-deep select {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 10px;
      width: 100%;
    }
  `,
})
export class TextField {
  readonly label = input.required<string>();
}
