import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, timer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClockService {
  readonly now = toSignal(timer(0, 30_000).pipe(map(() => Date.now())), {
    initialValue: Date.now(),
  });
}
