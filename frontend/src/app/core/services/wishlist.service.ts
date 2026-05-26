import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly api = `${environment.apiUrl}/wishlist`;

  constructor(private http: HttpClient) {}

  list(): Observable<Product[]> {
    return this.http.get<Product[]>(this.api);
  }

  add(productId: string): Observable<void> {
    return this.http.post<void>(`${this.api}/${productId}`, {});
  }

  remove(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${productId}`);
  }
}
