import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Coupon, ValidateCouponResponse } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly api = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  validate(code: string, subtotal: number): Observable<ValidateCouponResponse> {
    return this.http.post<ValidateCouponResponse>(`${this.api}/coupons/validate`, { code, subtotal });
  }

  listAdmin(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.api}/admin/coupons`);
  }

  create(body: Partial<Coupon>): Observable<Coupon> {
    return this.http.post<Coupon>(`${this.api}/admin/coupons`, body);
  }

  update(id: string, body: Partial<Coupon>): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.api}/admin/coupons/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/coupons/${id}`);
  }
}
