import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog.service';

export interface DirtyAware {
  isDirty(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<DirtyAware> = (component) => {
  const dialog = inject(ConfirmDialog);
  if (!component.isDirty()) return true;
  return dialog.ask('Discard unsaved changes?');
};
