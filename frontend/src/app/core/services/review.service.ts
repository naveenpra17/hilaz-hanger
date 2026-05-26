import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title?: string;
  body?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly api = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  list(productId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.api}/product/${productId}`);
  }

  create(productId: string, body: { rating: number; title?: string; body?: string }): Observable<Review> {
    return this.http.post<Review>(`${this.api}/product/${productId}`, body);
  }
}
