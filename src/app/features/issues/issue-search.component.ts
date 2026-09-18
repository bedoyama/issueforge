import { Component, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'forge-issue-search',
  template: `
    <input
      type="search"
      [value]="value()"
      placeholder="Search issues"
      (input)="onInput($any($event.target).value)"
    />
  `,
  styles: `
    input {
      width: min(320px, 100%);
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 8px;
      padding: 8px 10px;
    }
  `,
})
export class IssueSearch {
  readonly value = input('');
  readonly queryChange = output<string>();
  private readonly terms = new Subject<string>();
  private readonly emitDebounced = this.terms
    .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
    .subscribe((term) => this.queryChange.emit(term));

  onInput(value: string): void {
    this.terms.next(value);
  }
}
