import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../environment/environment';

interface TokenPayloadWithRoles {
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<
    string,
    {
      roles?: string[];
    }
  >;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private keycloak: Keycloak | null = null;

  readonly token = signal<string | null>(null);
  readonly isAuthenticated = signal(false);

  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    this.keycloak = new Keycloak({
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId,
    });

    const ok = await this.keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
    });

    this.isAuthenticated.set(ok);
    this.token.set(this.keycloak.token ?? null);
    console.log(this.keycloak.token);

    // keep token fresh
    setInterval(async () => {
      if (!this.keycloak) return;
      try {
        const refreshed = await this.keycloak.updateToken(30);
        if (refreshed) {
          this.token.set(this.keycloak.token ?? null);
          console.log('Refreshed Keycloak access token:', this.keycloak.token);
        }
      } catch {
        this.token.set(null);
        this.isAuthenticated.set(false);
      }
    }, 10_000);
  }

  login(): void {
    this.keycloak?.login();
  }

  logout(): void {
    this.keycloak?.logout({ redirectUri: window.location.origin + '/' });
  }

  getToken(): string | null {
    return this.token();
  }

  hasRole(role: string): boolean {
    const payload = this.getTokenPayload();
    if (!payload) return false;

    const expectedRole = role.toLowerCase();
    const roles = new Set<string>();

    for (const realmRole of payload.realm_access?.roles ?? []) {
      roles.add(realmRole.toLowerCase());
    }

    for (const clientAccess of Object.values(payload.resource_access ?? {})) {
      for (const clientRole of clientAccess.roles ?? []) {
        roles.add(clientRole.toLowerCase());
      }
    }

    return roles.has(expectedRole);
  }

  private getTokenPayload(): TokenPayloadWithRoles | null {
    const token = this.token();
    if (!token || !isPlatformBrowser(this.platformId)) return null;

    const payload = token.split('.')[1];
    if (!payload) return null;

    try {
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(
        normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
        '=',
      );

      return JSON.parse(atob(paddedPayload)) as TokenPayloadWithRoles;
    } catch {
      return null;
    }
  }
}
