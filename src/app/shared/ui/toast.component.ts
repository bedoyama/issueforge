import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'forge-toast-host',
  template: `
    <div class="stack">
      @for (t of toasts.toasts(); track t.id) {
        <p [attr.data-tone]="t.tone">{{ t.message }}</p>
      }
    </div>
  `,
  styles: `
    .stack {
      position: fixed;
      right: 16px;
      bottom: 16px;
      display: grid;
      gap: 8px;
      z-index: 50;
    }
    p {
      margin: 0;
      padding: 10px 14px;
      border-radius: 8px;
      background: var(--bg-elev);
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
    }
    p[data-tone='danger'] { border-color: var(--danger); }
    p[data-tone='ok'] { border-color: var(--ok); }
  `,
})
export class ToastHost {
  readonly toasts = inject(ToastService);
}
