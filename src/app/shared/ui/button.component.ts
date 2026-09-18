import { Component, input } from '@angular/core';

@Component({
  selector: 'forge-button',
  template: `
    <button [type]="type()" [disabled]="disabled()" [attr.data-variant]="variant()" [class.block]="block()">
      <ng-content />
    </button>
  `,
  styles: `
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      border: 1px solid var(--border);
      background: var(--bg-elev);
      color: var(--text);
      border-radius: var(--radius);
      padding: 8px 14px;
      cursor: pointer;
    }
    button.block { width: 100%; }
    button[data-variant='primary'] {
      background: var(--accent);
      color: var(--accent-ink);
      border-color: transparent;
    }
    button[data-variant='danger'] {
      background: var(--danger);
      color: #111;
      border-color: transparent;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    button:hover:not(:disabled) { filter: brightness(1.08); }
  `,
})
export class Button {
  readonly variant = input<'default' | 'primary' | 'danger'>('default');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly block = input(false);
}
