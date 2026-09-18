import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, merge, of, Subject, switchMap, tap, timer } from 'rxjs';
import { AuthSession } from '../auth/auth.session';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(AuthSession);
  private readonly reload$ = new Subject<void>();

  readonly items = toSignal(
    toObservable(this.session.user).pipe(
      switchMap((user) => {
        if (!user) return of([] as Notification[]);
        return merge(timer(0, 8_000), this.reload$).pipe(
          switchMap(() =>
            this.http.get<Notification[]>('/api/notifications').pipe(
              catchError(() => of([] as Notification[])),
            ),
          ),
        );
      }),
    ),
    { initialValue: [] as Notification[] },
  );

  readonly unreadCount = computed(() => this.items().filter((n) => !n.read).length);

  refresh(): void {
    this.reload$.next();
  }

  markRead(id: string) {
    return this.http.patch<Notification>(`/api/notifications/${id}`, { read: true }).pipe(tap(() => this.refresh()));
  }
}
