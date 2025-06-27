import {inject, Injectable, signal} from '@angular/core';
import {UserInterface} from './models/user-interface';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {LoginResponseModel} from './models/login-response-model';
import {jwtDecode} from 'jwt-decode';
import {catchError, map, Observable, of} from 'rxjs';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private router = inject(Router);

  private currentUser = signal<UserInterface | null>(null);

  constructor() {
    const token = this.getToken();

    if (token) {
      const user = this.decodeTokenToUser(token);
      this.currentUser.set(user);
    }
  }

  login(email: string, password: string): Observable<{ success: boolean; error?: string }> {
    console.log('Using API URL:', environment.apiUrl);
    return this.http
      .post<LoginResponseModel>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        map(response => {
          const rawToken = response.data.token;
          this.setToken(rawToken);
          const user = this.decodeTokenToUser(rawToken);
          this.currentUser.set(user);
          return { success: true };
        }),
        catchError(err => {
          const errorMessage =
            err?.error?.message || 'Login failed. Please try again.';
          return of({ success: false, error: errorMessage });
        })
      );
  }

  decodeTokenToUser(token: string): UserInterface {
    const decodedToken: any = jwtDecode(token);
    return {
      id: decodedToken._id,
      email: decodedToken.email,
      firstName: decodedToken.firstName,
      fullName: decodedToken.fullName,
      role: decodedToken.role,
      token: token
    };
  }

  setToken(token: string) {
    sessionStorage.setItem('token', token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  logout() {
    // unset token
    sessionStorage.removeItem('token');
    // reset current user
    this.currentUser.set(null);
  }

  getUser(): UserInterface | null {
    return this.currentUser();
  }

}
