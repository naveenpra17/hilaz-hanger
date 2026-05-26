import { ApplicationConfig, APP_INITIALIZER, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AnalyticsService } from './core/services/analytics.service';
import { SeoService } from './core/services/seo.service';

function initApp(analytics: AnalyticsService, seo: SeoService) {
  return () => {
    seo.setDefault();
    analytics.init();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AnalyticsService, SeoService],
      multi: true,
    },
  ],
};
