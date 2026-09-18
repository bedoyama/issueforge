import { Component, input } from '@angular/core';

@Component({
  selector: 'forge-avatar',
  template: `<span [style.background]="'hsl(' + hue() + ' 55% 42%)'">{{ initials() }}</span>`,
  styles: `
    span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 600;
      color: white;
    }
  `,
})
export class Avatar {
  readonly name = input.required<string>();
  readonly hue = input(200);
  readonly initials = () =>
    this.name()
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
}
