import { Component, inject, signal } from '@angular/core';
import { FailStatus, MockConfigService } from '../core/mock-backend/mock.config';
import { MockStore } from '../core/mock-backend/mock.store';
import { ClickOutside } from '../shared/directives/click-outside.directive';

@Component({
  selector: 'forge-error-injection-panel',
  imports: [ClickOutside],
  template: `
    <div class="wrap" (clickOutside)="open.set(false)">
      <button type="button" (click)="open.update((v) => !v)">Chaos</button>
      @if (open()) {
        <div class="panel">
          <label>Latency {{ config.latencyMs() }}ms
            <input type="range" min="0" max="5000" step="50" [value]="config.latencyMs()"
              (input)="config.setLatency(+( $any($event.target).value ))" />
          </label>
          <label>Fail status
            <select [value]="config.failStatus() ?? ''" (change)="onStatus($event)">
              <option value="">off</option>
              <option value="0">timeout (0)</option>
              <option value="401">401</option>
              <option value="403">403</option>
              <option value="500">500</option>
            </select>
          </label>
          <label>URL contains
            <input [value]="config.failUrlIncludes()" (input)="config.setFailUrlIncludes($any($event.target).value)" placeholder="/api/issues or *" />
          </label>
          <button type="button" (click)="reset()">Reset demo data</button>
          <ol>
            @for (row of store.log; track $index) {
              <li>{{ row.method }} {{ row.status }} {{ row.url }}</li>
            } @empty {
              <li>No requests yet</li>
            }
          </ol>
        </div>
      }
    </div>
  `,
  styles: `
    .wrap { position: relative; }
    button { background: var(--bg-elev); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 6px 10px; cursor: pointer; }
    .panel {
      position: absolute; right: 0; top: 120%; width: 280px; background: var(--bg-elev);
      border: 1px solid var(--border); border-radius: 12px; padding: 12px; display: grid; gap: 8px;
      box-shadow: var(--shadow); z-index: 20; font-size: 12px;
    }
    label { display: grid; gap: 4px; color: var(--text-muted); }
    input, select { background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 6px; padding: 4px 6px; }
    ol { margin: 0; padding-left: 1rem; max-height: 140px; overflow: auto; color: var(--text-muted); }
  `,
})
export class ErrorInjectionPanel {
  readonly config = inject(MockConfigService);
  readonly store = inject(MockStore);
  readonly open = signal(false);

  onStatus(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.config.setFailStatus(v === '' ? null : (Number(v) as FailStatus));
  }

  reset(): void {
    this.config.resetDemoData();
    window.location.reload();
  }
}
