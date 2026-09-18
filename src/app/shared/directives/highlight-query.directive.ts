import { Directive, effect, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[highlightQuery]',
})
export class HighlightQuery {
  private readonly el = inject(ElementRef<HTMLElement>);
  readonly highlightQuery = input('');
  readonly text = input('');

  // Re-wrap matches when the query or source text changes.
  private readonly sync = effect(() => {
    const query = this.highlightQuery().trim();
    const source = this.text();
    if (!query) {
      this.el.nativeElement.textContent = source;
      return;
    }
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'ig');
    this.el.nativeElement.innerHTML = source.replace(re, (m) => `<mark>${m}</mark>`);
  });
}
