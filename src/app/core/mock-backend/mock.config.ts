import { inject, Injectable, signal } from '@angular/core';
import { MockStore } from './mock.store';

const CONFIG_KEY = 'issueforge.mock';

export type FailStatus = 0 | 401 | 403 | 500 | null;

export interface MockConfig {
  latencyMs: number;
  failStatus: FailStatus;
  failUrlIncludes: string;
}

function readConfig(): MockConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return { latencyMs: 300, failStatus: null, failUrlIncludes: '' };
    const parsed = JSON.parse(raw) as Partial<MockConfig>;
    return {
      latencyMs: typeof parsed.latencyMs === 'number' ? parsed.latencyMs : 300,
      failStatus: (parsed.failStatus as FailStatus) ?? null,
      failUrlIncludes: parsed.failUrlIncludes ?? '',
    };
  } catch {
    return { latencyMs: 300, failStatus: null, failUrlIncludes: '' };
  }
}

@Injectable({ providedIn: 'root' })
export class MockConfigService {
  private readonly store = inject(MockStore);
  private readonly initial = readConfig();

  readonly latencyMs = signal(this.initial.latencyMs);
  readonly failStatus = signal<FailStatus>(this.initial.failStatus);
  readonly failUrlIncludes = signal(this.initial.failUrlIncludes);

  setLatency(ms: number): void {
    this.latencyMs.set(ms);
    this.save();
  }

  setFailStatus(status: FailStatus): void {
    this.failStatus.set(status);
    this.save();
  }

  setFailUrlIncludes(value: string): void {
    this.failUrlIncludes.set(value);
    this.save();
  }

  resetDemoData(): void {
    this.store.reset();
    this.latencyMs.set(300);
    this.failStatus.set(null);
    this.failUrlIncludes.set('');
    this.save();
  }

  private save(): void {
    const payload: MockConfig = {
      latencyMs: this.latencyMs(),
      failStatus: this.failStatus(),
      failUrlIncludes: this.failUrlIncludes(),
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(payload));
  }
}
