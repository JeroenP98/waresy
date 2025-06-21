import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {map, Observable} from 'rxjs';
import {User} from '../../../shared/models/users/user';
import {UserApiResponse} from '../../../shared/models/users/user-api-response';
import {CreateUserDto} from '../../../shared/models/users/create-user-dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getUsers(): Observable<User[]> {
    return this.http
      .get<UserApiResponse>(`${this.apiUrl}/auth/users`)
      .pipe(map(response => response.data));
  }

  postUser(user: CreateUserDto): Observable<User> {
    return this.http.post<{ success: boolean; message: string; data: User }>(
      `${this.apiUrl}/auth/register`,
      user
    ).pipe(
      map(response => response.data)
    );
  }

  deleteUser(email: string): Observable<User> {
    return this.http
      .delete<{ success: boolean; message: string; data: User }>(`${this.apiUrl}/auth/user/${email}`)
      .pipe(map(res => res.data));
  }

}
