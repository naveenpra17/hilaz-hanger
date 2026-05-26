import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  contact(body: { name: string; email: string; message: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/contact`, body);
  }

  subscribeNewsletter(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/newsletter/subscribe`, { email });
  }

  shippingQuote(subtotal: number): Observable<{ shippingPrice: number; description: string }> {
    return this.http.get<{ shippingPrice: number; description: string }>(`${this.api}/shipping/quote`, {
      params: { subtotal: String(subtotal) },
    });
  }

  health(): Observable<{ status: string; cloudinaryConfigured?: boolean }> {
    return this.http.get<{ status: string; cloudinaryConfigured?: boolean }>(`${this.api}/health`);
  }
}
