import { Injectable, inject, signal } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

import { environment } from '../../environment/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oidcSecurityService = inject(OidcSecurityService);

  readonly token = signal<string | null>(null);
  readonly isAuthenticated = signal(false);
  readonly userData = signal<any>(null);

  constructor() {
    this.oidcSecurityService.isAuthenticated$.subscribe(({ isAuthenticated }) => {
      this.isAuthenticated.set(isAuthenticated);

      if (!isAuthenticated) {
        this.token.set(null);
        return;
      }

      this.oidcSecurityService.getAccessToken().subscribe((token) => {
        this.token.set(token || null);
      });
    });

    this.oidcSecurityService.userData$.subscribe(({ userData }) => {
      this.userData.set(userData ?? null);
    });
  }

  login(): void {
    this.oidcSecurityService.authorize();
  }

  logout(): void {
    this.oidcSecurityService.logoffLocal();

    const logoutUrl =
      `${environment.auth.domain}/logout` +
      `?client_id=${environment.auth.clientId}` +
      `&logout_uri=${encodeURIComponent(environment.auth.postLogoutRedirectUri)}`;

    window.location.href = logoutUrl;
  }

  getToken(): string | null {
    return this.token();
  }

  hasRole(role: string): boolean {
    const groups = this.userData()?.['cognito:groups'] ?? [];
    return groups.includes(role);
  }
}
