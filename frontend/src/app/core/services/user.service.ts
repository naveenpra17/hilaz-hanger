import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = `${environment.apiUrl}/users/me`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(this.api);
  }

  updateProfile(body: { fullName: string; phone?: string }): Observable<User> {
    return this.http.patch<User>(this.api, body);
  }

  changePassword(body: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.patch<void>(`${this.api}/password`, body);
  }
}
