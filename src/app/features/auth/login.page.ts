import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { email, form, FormField, required } from '@angular/forms/signals';
import { AuthSession } from '../../core/auth/auth.session';
import { safeRedirect } from '../../core/auth/safe-redirect';
import { Button } from '../../shared/ui/button.component';
import { TextField } from '../../shared/ui/text-field.component';

@Component({
  selector: 'forge-login-page',
  imports: [FormField, Button, TextField],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
})
export class LoginPage {
  private readonly session = inject(AuthSession);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly model = signal({
    email: 'ada@board.dev',
    password: 'password',
  });

  protected readonly loginForm = form(this.model, (schema) => {
    required(schema.email, { message: 'Email is required' });
    email(schema.email, { message: 'Enter a valid email address' });
    required(schema.password, { message: 'Password is required' });
  });

  protected error = '';

  submit(event: Event): void {
    event.preventDefault();
    if (!this.loginForm().valid()) return;
    this.error = '';
    const { email: address, password } = this.model();
    this.session.login(address, password).subscribe({
      next: () => {
        const raw = this.route.snapshot.queryParamMap.get('redirect');
        void this.router.navigateByUrl(this.router.parseUrl(safeRedirect(raw)));
      },
      error: () => {
        this.error = 'Email or password is wrong.';
      },
    });
  }
}
