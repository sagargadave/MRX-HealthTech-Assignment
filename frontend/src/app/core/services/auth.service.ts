import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api-base';
import { ApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';

const TOKEN_KEY = 'hmd_token';
const USER_KEY = 'hmd_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Reactive signal so the layout/sidebar can show the logged-in doctor's name reactively. */
  currentUser = signal<User | null>(this.readStoredUser());

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<ApiResponse<{ token: string; user: User }>> {
    return this.http
      .post<ApiResponse<{ token: string; user: User }>>(`${API_BASE_URL}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          if (res.success) {
            localStorage.setItem(TOKEN_KEY, res.data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
            this.currentUser.set(res.data.user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  register(payload: { name: string; email: string; password: string }): Observable<ApiResponse<User>> {
  return this.http.post<ApiResponse<User>>(`${API_BASE_URL}/auth/register`, payload);
  
  }

}
