import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Role } from '../models/user.model';
import { AuthSession } from './auth.session';

@Directive({
  selector: '[hasRole]',
})
export class HasRole {
  private readonly tpl = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly session = inject(AuthSession);
  readonly hasRole = input.required<Role | Role[]>();

  // Teaching exhibit: project the view from signals. Prefer @if in product chrome.
  private readonly sync = effect(() => {
    const allowed = this.session.hasRole(this.hasRole());
    this.vcr.clear();
    if (allowed) this.vcr.createEmbeddedView(this.tpl);
  });
}
