import { effect, Injectable, signal } from '@angular/core';
import { BoardFilterSlice } from '../models/issue.model';

export { EMPTY_BOARD_FILTERS } from '../models/issue.model';

const PREFS_KEY = 'issueforge.prefs';

interface PrefsPayload {
  theme: 'dark' | 'light';
  boardFilters: Record<string, BoardFilterSlice>;
}

function readPrefs(): PrefsPayload {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { theme: 'dark', boardFilters: {} };
    const parsed = JSON.parse(raw) as Partial<PrefsPayload>;
    return {
      theme: parsed.theme === 'light' ? 'light' : 'dark',
      boardFilters: parsed.boardFilters ?? {},
    };
  } catch {
    return { theme: 'dark', boardFilters: {} };
  }
}

@Injectable({ providedIn: 'root' })
export class PrefsService {
  private readonly initial = readPrefs();
  readonly theme = signal<'dark' | 'light'>(this.initial.theme);
  readonly boardFilters = signal<Record<string, BoardFilterSlice>>(this.initial.boardFilters);

  patchBoardFilters(projectId: string, slice: BoardFilterSlice): void {
    this.boardFilters.update((all) => ({ ...all, [projectId]: slice }));
  }

  toggleTheme(): void {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  private readonly persist = effect(() => {
    const theme = this.theme();
    const payload: PrefsPayload = {
      theme,
      boardFilters: this.boardFilters(),
    };
    localStorage.setItem(PREFS_KEY, JSON.stringify(payload));
    document.documentElement.dataset['theme'] = theme;
  });
}
