import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private keycloak: Keycloak | null = null;

  readonly token = signal<string | null>(null);
  readonly isAuthenticated = signal(false);

  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    this.keycloak = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'NestJS',
      clientId: 'frontend',
    });

    const ok = await this.keycloak.init({
      onLoad: 'login-required',
      pkceMethod: 'S256',
    });

    this.isAuthenticated.set(ok);
    this.token.set(this.keycloak.token ?? null);

    // keep token fresh
    setInterval(async () => {
      if (!this.keycloak) return;
      try {
        const refreshed = await this.keycloak.updateToken(30);
        if (refreshed) this.token.set(this.keycloak.token ?? null);
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
    this.keycloak?.logout({ redirectUri: 'http://localhost:4200/' });
  }

  getToken(): string | null {
    return this.token();
  }
}
