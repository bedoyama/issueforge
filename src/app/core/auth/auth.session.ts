import { HttpClient, HttpContext } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, of, tap } from 'rxjs';
import { SKIP_ERROR_TOAST } from '../http/api.tokens';
import { AuthResponse, SessionUser } from '../models/auth.model';
import { Role, ROLE_RANK } from '../models/user.model';

const AUTH_KEY = 'issueforge.auth';

function readStored(): { token: string; user: SessionUser } | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { token: string; user: SessionUser };
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly stored = readStored();

  readonly token = signal<string | null>(this.stored?.token ?? null);
  readonly user = signal<SessionUser | null>(this.stored?.user ?? null);
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly role = computed(() => this.user()?.role ?? null);

  /**
   * Single role: current rank >= min (admin satisfies 'member').
   * Array: exact match — current role is ANY of the listed roles.
   */
  hasRole(min: Role | Role[]): boolean {
    const current = this.role();
    if (!current) return false;
    if (Array.isArray(min)) return min.includes(current);
    return ROLE_RANK[current] >= ROLE_RANK[min];
  }

  login(email: string, password: string): Observable<SessionUser> {
    return this.http
      .post<AuthResponse>(
        '/api/auth/login',
        { email, password },
        { context: new HttpContext().set(SKIP_ERROR_TOAST, true) },
      )
      .pipe(
        tap((res) => this.setSession(res)),
        map((res) => res.user),
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(
      tap({
        next: () => this.clear(),
        error: () => this.clear(),
      }),
    );
  }

  restore(): Observable<SessionUser | null> {
    if (!this.token()) return of(null);
    return this.http.get<SessionUser>('/api/auth/me').pipe(
      tap({
        next: (user) => this.user.set(user),
        error: () => this.clear(),
      }),
    );
  }

  impersonate(userId: string): Observable<SessionUser> {
    return this.http.post<AuthResponse>('/api/auth/impersonate', { userId }).pipe(
      tap((res) => {
        this.setSession(res);
        if (this.router.url.startsWith('/admin') && !this.hasRole('admin')) {
          void this.router.navigateByUrl('/');
        }
      }),
      map((res) => res.user),
    );
  }

  clear(): void {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem(AUTH_KEY);
  }

  private setSession(res: AuthResponse): void {
    this.token.set(res.token);
    this.user.set(res.user);
    localStorage.setItem(AUTH_KEY, JSON.stringify(res));
  }
}
