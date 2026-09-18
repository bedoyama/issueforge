import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthSession } from './core/auth/auth.session';
import { authInterceptor } from './core/auth/auth.interceptor';
import { errorToastInterceptor } from './core/http/error-toast.interceptor';
import { loadingInterceptor } from './core/http/loading.interceptor';
import { mockApiInterceptor } from './core/mock-backend/mock-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loadingInterceptor,
        errorToastInterceptor,
        mockApiInterceptor,
      ]),
    ),
    provideAppInitializer(() => inject(AuthSession).restore()),
  ],
};
