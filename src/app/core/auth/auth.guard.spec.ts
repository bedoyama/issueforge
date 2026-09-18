import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthSession } from './auth.session';

describe('authGuard', () => {
  it('sends anonymous users to login with a redirect query', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthSession, useValue: { isAuthenticated: () => false } },
      ],
    });
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/projects/prj_if' } as never),
    );
    expect(result).toEqual(
      router.createUrlTree(['/login'], { queryParams: { redirect: '/projects/prj_if' } }),
    );
  });
});
