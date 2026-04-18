import { Injectable, inject, signal } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

import { environment } from '../../environment/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oidcSecurityService = inject(OidcSecurityService);

  readonly token = signal<string | null>(null);
  readonly isAuthenticated = signal(false);
  readonly userData = signal<any>(null);
  readonly groups = signal<string[]>([]);

  constructor() {
    this.oidcSecurityService.checkAuth().subscribe(({ isAuthenticated }) => {
      console.log('checkAuth result:', isAuthenticated);
    });

    this.oidcSecurityService.isAuthenticated$.subscribe(({ isAuthenticated }) => {
      if (!isAuthenticated) {
        this.token.set(null);
        this.groups.set([]);
        this.isAuthenticated.set(false);
        return;
      }

      this.oidcSecurityService.getAccessToken().subscribe((token) => {
        this.token.set(token || null);
        this.groups.set(this.getGroupsFromToken(token));
        this.isAuthenticated.set(!!token);
      });
    });

    this.oidcSecurityService.userData$.subscribe(({ userData }) => {
      this.userData.set(userData ?? null);
    });
  }

  login(): void {
    console.log('Login clicked, calling Cognito authorize');
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
    return this.groups().some((group) => group.toLowerCase() === role.toLowerCase());
  }

  private getGroupsFromToken(token: string | null): string[] {
    if (!token) return [];

    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(atob(base64));

      return decodedPayload['cognito:groups'] ?? [];
    } catch {
      return [];
    }
  }
}
