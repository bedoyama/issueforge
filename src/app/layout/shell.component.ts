import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthSession } from '../core/auth/auth.session';
import { HasRole } from '../core/auth/has-role.directive';
import { LoadingService } from '../core/http/loading.service';
import { NotificationsService } from '../core/notifications/notifications.service';
import { PrefsService } from '../core/prefs/prefs.service';
import { ClickOutside } from '../shared/directives/click-outside.directive';
import { ToastHost } from '../shared/ui/toast.component';
import { DemoUserSwitcher } from './demo-user-switcher.component';
import { ErrorInjectionPanel } from './error-injection-panel.component';

@Component({
  selector: 'forge-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    DemoUserSwitcher,
    ErrorInjectionPanel,
    ToastHost,
    HasRole,
    ClickOutside,
  ],
  template: `
    <div class="bar" [class.on]="loading.inFlight() > 0"></div>
    <header>
      <a routerLink="/" class="logo">IssueForge</a>
      <nav>
        <a routerLink="/projects" routerLinkActive="active">Projects</a>
        <a routerLink="/inbox" routerLinkActive="active">
          Inbox
          @if (notes.unreadCount() > 0) {
            <span class="bell">{{ notes.unreadCount() }}</span>
          }
        </a>
        @if (session.hasRole('admin')) {
          <a routerLink="/admin" routerLinkActive="active">Admin</a>
        }
      </nav>
      <div class="tools">
        <a *hasRole="'member'" routerLink="/projects/prj_if/issues/new" class="demo-new">New issue</a>
        <forge-error-injection-panel />
        <forge-demo-user-switcher />
        <button type="button" (click)="prefs.toggleTheme()">{{ prefs.theme() === 'dark' ? 'Light' : 'Dark' }}</button>
        <div class="user" (clickOutside)="menu.set(false)">
          <button type="button" (click)="menu.update((v) => !v)">{{ session.user()?.name }} · {{ session.role() }}</button>
          @if (menu()) {
            <div class="menu">
              <button type="button" (click)="logout()">Log out</button>
            </div>
          }
        </div>
      </div>
    </header>
    <main>
      <router-outlet />
    </main>
    <forge-toast-host />
  `,
  styles: `
    .bar { height: 2px; background: transparent; }
    .bar.on { background: var(--accent); }
    header {
      display: flex; align-items: center; gap: 16px; padding: 10px 20px;
      border-bottom: 1px solid var(--border); background: var(--bg-elev);
    }
    .logo { font-weight: 700; color: var(--text); text-decoration: none; }
    nav { display: flex; gap: 12px; flex: 1; }
    nav a { color: var(--text-muted); }
    nav a.active { color: var(--text); }
    .tools { display: flex; align-items: center; gap: 10px; }
    .bell { background: var(--danger); color: #111; border-radius: 999px; padding: 0 6px; font-size: 11px; margin-left: 4px; }
    .demo-new { font-size: 12px; color: var(--accent); }
    .user { position: relative; }
    .menu { position: absolute; right: 0; top: 120%; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 8px; padding: 8px; }
    button { background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 6px 10px; cursor: pointer; }
  `,
})
export class Shell {
  readonly session = inject(AuthSession);
  readonly prefs = inject(PrefsService);
  readonly loading = inject(LoadingService);
  readonly notes = inject(NotificationsService);
  readonly menu = signal(false);

  private readonly router = inject(Router);

  logout(): void {
    this.session.logout().subscribe({
      next: () => void this.router.navigateByUrl('/login'),
      error: () => void this.router.navigateByUrl('/login'),
    });
  }
}
