import { Component } from '@angular/core';

@Component({
  selector: 'forge-spinner',
  template: `<span class="spin" aria-label="Loading"></span>`,
  styles: `
    .spin {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `,
})
export class Spinner {}
