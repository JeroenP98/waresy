import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './core/auth/auth..interceptor';
import {providePrimeNG} from 'primeng/config';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers:
    [
      providePrimeNG({
        theme: {
          preset: 'aura',
        }
      }),
      provideAnimationsAsync(),
      provideHttpClient(withInterceptors([authInterceptor])),
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),

    ]

};
