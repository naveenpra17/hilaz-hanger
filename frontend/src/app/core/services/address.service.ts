import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SavedAddress } from '../models/address.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly api = `${environment.apiUrl}/users/me/addresses`;

  constructor(private http: HttpClient) {}

  list(): Observable<SavedAddress[]> {
    return this.http
      .get<SavedAddress[]>(this.api)
      .pipe(map((list) => list.map((a) => ({ ...a, id: String(a.id) }))));
  }

  create(req: Omit<SavedAddress, 'id'>): Observable<SavedAddress> {
    return this.http.post<SavedAddress>(this.api, req).pipe(map((a) => ({ ...a, id: String(a.id) })));
  }

  update(id: string, req: Omit<SavedAddress, 'id'>): Observable<SavedAddress> {
    return this.http
      .put<SavedAddress>(`${this.api}/${id}`, req)
      .pipe(map((a) => ({ ...a, id: String(a.id) })));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
