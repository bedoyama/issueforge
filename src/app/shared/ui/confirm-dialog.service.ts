import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmDialog {
  ask(message: string): boolean {
    return window.confirm(message);
  }
}
