import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

const TOKEN_KEY = 'hilaz_token';
const USER_KEY = 'hilaz_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;
  private readonly userSignal = signal<User | null>(this.loadUser());

  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.userSignal() && !!this.token());
  readonly isAdmin = computed(() => this.userSignal()?.role === 'ADMIN');
  readonly token = signal<string | null>(this.loadToken());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.clearExpiredSession();
  }

  login(req: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.api}/login`, req).pipe(
      tap((res) => this.setSession(this.normalizeResponse(res)))
    );
  }

  register(req: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.api}/register`, req).pipe(
      tap((res) => this.setSession(this.normalizeResponse(res)))
    );
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(`${this.api}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<{ message: string }>(`${this.api}/reset-password`, { token, newPassword });
  }

  private normalizeResponse(res: AuthResponse): AuthResponse {
    return {
      ...res,
      user: { ...res.user, id: String(res.user.id) },
    };
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.userSignal.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    this.clearExpiredSession();
    return this.token();
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.token.set(res.token);
    this.userSignal.set(res.user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private loadToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || this.isExpired(token)) return null;
    return token;
  }

  private clearExpiredSession(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !this.isExpired(token)) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.userSignal.set(null);
  }

  private isExpired(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return true;
      const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson) as { exp?: number };
      if (!payload.exp) return false;
      const now = Math.floor(Date.now() / 1000);
      return payload.exp <= now;
    } catch {
      return true;
    }
  }
}
