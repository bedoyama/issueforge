import { Component, inject } from '@angular/core';
import { AuthSession } from '../core/auth/auth.session';

const DEMO_USERS = [
  { id: 'usr_ada', label: 'Ada (admin)' },
  { id: 'usr_linus', label: 'Linus (member)' },
  { id: 'usr_grace', label: 'Grace (viewer)' },
  { id: 'usr_margaret', label: 'Margaret (member)' },
  { id: 'usr_dennis', label: 'Dennis (member)' },
];

@Component({
  selector: 'forge-demo-user-switcher',
  template: `
    <label>
      Demo
      <select [value]="session.user()?.id ?? ''" (change)="onChange($event)">
        @for (u of users; track u.id) {
          <option [value]="u.id">{{ u.label }}</option>
        }
      </select>
    </label>
  `,
  styles: `
    label { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-muted); }
    select { background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 4px 8px; }
  `,
})
export class DemoUserSwitcher {
  readonly session = inject(AuthSession);
  readonly users = DEMO_USERS;

  onChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.session.impersonate(id).subscribe();
  }
}
