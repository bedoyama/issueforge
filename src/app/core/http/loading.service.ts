import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly count = signal(0);
  readonly inFlight = computed(() => this.count());

  begin(): void {
    this.count.update((n) => n + 1);
  }

  end(): void {
    this.count.update((n) => Math.max(0, n - 1));
  }
}
