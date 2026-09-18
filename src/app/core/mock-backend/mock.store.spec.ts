import { TestBed } from '@angular/core/testing';
import { createSeedDb } from './mock.seed';
import { DB_KEY, MockStore } from './mock.store';

const mem = new Map<string, string>();

describe('MockStore', () => {
  beforeEach(() => {
    mem.clear();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (k: string) => mem.get(k) ?? null,
        setItem: (k: string, v: string) => mem.set(k, v),
        removeItem: (k: string) => mem.delete(k),
        clear: () => mem.clear(),
      },
    });
    TestBed.configureTestingModule({});
  });

  it('persists without a passwords key', () => {
    const store = TestBed.inject(MockStore);
    const raw = JSON.parse(localStorage.getItem(DB_KEY)!);
    expect(raw.passwords).toBeUndefined();
    expect(store.snapshot().issues.length).toBe(32);
  });

  it('increments IF sequence after a create-style mutate', () => {
    const store = TestBed.inject(MockStore);
    store.mutate((db) => {
      db.issueSeqByProject['prj_if'] += 1;
    });
    expect(store.snapshot().issueSeqByProject['prj_if']).toBe(15);
  });

  it('reset restores seed', () => {
    const store = TestBed.inject(MockStore);
    store.replace({ ...createSeedDb(), issues: [] });
    store.reset();
    expect(store.snapshot().issues.length).toBe(32);
  });
});
