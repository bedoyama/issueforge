import { Component, input } from '@angular/core';

@Component({
  selector: 'forge-badge',
  template: `<span [style.--tone]="tone()"><ng-content /></span>`,
  styles: `
    span {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 12px;
      background: color-mix(in srgb, var(--tone, var(--border)) 25%, transparent);
      color: var(--tone, var(--text));
      border: 1px solid color-mix(in srgb, var(--tone, var(--border)) 50%, transparent);
    }
  `,
})
export class Badge {
  readonly tone = input('var(--text-muted)');
}
