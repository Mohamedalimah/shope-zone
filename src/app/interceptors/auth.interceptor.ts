import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/user.model';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const userId = localStorage.getItem('userId');

  let clonedReq = req;
  if (userId) {
    clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${userId}` },
    });
  }

  return next(clonedReq).pipe(
    tap((event) => {
      // Only process login responses (array of users from query params)
      if (
        req.url.includes('/users?email=') &&
        req.method === 'GET' &&
        event.type !== 0
      ) {
        const httpEvent = event as { type: number; body?: unknown };
        if (httpEvent.body && Array.isArray(httpEvent.body)) {
          const users = httpEvent.body as User[];
          if (users.length > 0) {
            const user = users[0];
            localStorage.setItem('userId', String(user.id));
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
        }
      }
    })
  );
};
