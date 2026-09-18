import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, throwError, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MockConfigService } from './mock.config';
import { dispatchMock } from './mock.router';
import { MockStore } from './mock.store';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) return next(req);

  const store = inject(MockStore);
  const config = inject(MockConfigService);
  const latency = Math.max(0, config.latencyMs());
  const jitter = latency === 0 ? 0 : 250 + Math.floor(Math.random() * 151);
  const delayMs = config.latencyMs() === 300 ? jitter : latency;

  return timer(delayMs).pipe(
    switchMap(() => {
      const fail = config.failStatus();
      const needle = config.failUrlIncludes();
      if (fail !== null && needle && (needle === '*' || req.url.includes(needle))) {
        store.record(req.method, req.url, fail);
        return throwError(
          () =>
            new HttpErrorResponse({
              status: fail,
              statusText: fail === 0 ? 'Timeout' : 'Injected failure',
              url: req.url,
              error: { error: 'injected', message: 'Demo error injection.' },
            }),
        );
      }

      const result = dispatchMock(
        req.method,
        req.urlWithParams,
        req.body,
        req.headers.get('Authorization'),
        store,
      );
      store.record(req.method, req.urlWithParams, result.status);
      if (result.status >= 400) {
        return throwError(
          () =>
            new HttpErrorResponse({
              status: result.status,
              statusText: 'Mock error',
              url: req.url,
              error: result.body,
            }),
        );
      }
      return of(new HttpResponse({ status: result.status, body: result.body, url: req.url }));
    }),
  );
};
