import { Directive, ElementRef, inject, output } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  host: {
    '(document:pointerdown)': 'onPointer($event)',
  },
})
export class ClickOutside {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly clickOutside = output<void>();

  onPointer(event: PointerEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.clickOutside.emit();
    }
  }
}
