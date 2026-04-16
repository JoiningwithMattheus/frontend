import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { LogLevel, provideAuth, withAppInitializerAuthCheck } from 'angular-auth-oidc-client';
import { authInterceptor } from './core/auth.interceptor';

import { routes } from './app.routes';
import { environment } from '../environment/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideClientHydration(withEventReplay()),

    provideAuth(
      {
        config: {
          authority: environment.auth.authority,
          redirectUrl: environment.auth.redirectUrl,
          postLogoutRedirectUri: environment.auth.postLogoutRedirectUri,
          clientId: environment.auth.clientId,
          scope: environment.auth.scope,
          responseType: environment.auth.responseType,
          secureRoutes: environment.auth.secureRoutes,
          silentRenew: false,
          useRefreshToken: false,
          logLevel: LogLevel.Debug,
        },
      },
      withAppInitializerAuthCheck(),
    ),
  ],
};
