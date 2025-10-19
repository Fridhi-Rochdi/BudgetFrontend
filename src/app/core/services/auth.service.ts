import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, switchMap, tap, throwError } from 'rxjs';
import { AuthResponse, LoginPayload, RegisterPayload } from '../models/auth.model';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  login(payload: LoginPayload) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap(tokens => this.tokenStorage.storeTokens(tokens)),
      switchMap(() => this.loadProfile())
    );
  }

  register(payload: RegisterPayload) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap(tokens => this.tokenStorage.storeTokens(tokens)),
      switchMap(() => this.loadProfile())
    );
  }

  refreshToken() {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Missing refresh token'));
    }
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(tap(tokens => this.tokenStorage.storeTokens(tokens)));
  }

  loadProfile() {
    return this.http.get<UserProfile>(`${environment.apiUrl}/users/me`).pipe(
      tap((user: UserProfile) => this.currentUserSubject.next(user))
    );
  }

  logout() {
    this.tokenStorage.clear();
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.tokenStorage.getAccessToken();
  }

  getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }
}
