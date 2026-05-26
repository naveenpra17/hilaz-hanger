import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CheckoutRequest,
  CheckoutResponse,
  CreateOfflineOrderRequest,
  DashboardStats,
  Order,
  OrderTracking,
  VerifyPaymentRequest,
} from '../models/order.model';
import { MOCK_ORDERS, MOCK_DASHBOARD } from '../data/mock-orders';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = `${environment.apiUrl}`;
  private readonly useMock = environment.useMock;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardStats> {
    if (this.useMock) return of(MOCK_DASHBOARD).pipe(delay(200));
    return this.http.get<DashboardStats>(`${this.api}/admin/dashboard`);
  }

  getOrders(): Observable<Order[]> {
    if (this.useMock) return of(MOCK_ORDERS).pipe(delay(200));
    return this.http
      .get<Order[]>(`${this.api}/admin/orders`)
      .pipe(map((orders) => orders.map((o) => this.normalizeOrder(o))));
  }

  checkout(req: CheckoutRequest): Observable<CheckoutResponse> {
    if (this.useMock) {
      return of({
        order: {
          id: crypto.randomUUID(),
          orderNumber: 'HH-MOCK',
          customerName: '',
          customerPhone: '',
          orderSource: 'WEBSITE' as const,
          status: 'PENDING' as const,
          paymentStatus: 'UNPAID' as const,
          subtotal: 0,
          shippingPrice: 0,
          discount: 0,
          total: 0,
          shippingStreet: req.shippingStreet,
          shippingCity: req.shippingCity,
          shippingPincode: req.shippingPincode,
          paid: false,
          delivered: false,
          items: [],
          createdAt: new Date().toISOString(),
        },
        requiresPayment: req.paymentMethod !== 'COD',
        razorpayKeyId: environment.razorpayKey,
        amountPaise: 0,
      }).pipe(delay(300));
    }
    return this.http.post<CheckoutResponse>(`${this.api}/orders/checkout`, req);
  }

  verifyPayment(req: VerifyPaymentRequest): Observable<Order> {
    if (this.useMock) return of(MOCK_ORDERS[0]);
    return this.http
      .post<Order>(`${this.api}/orders/verify-payment`, req)
      .pipe(map((o) => this.normalizeOrder(o)));
  }

  createOfflineOrder(req: CreateOfflineOrderRequest): Observable<Order> {
    if (this.useMock) {
      const total = 1499;
      return of({
        id: crypto.randomUUID(),
        orderNumber: 'HH-' + Date.now().toString(36).toUpperCase(),
        customerName: req.customerName,
        customerPhone: req.customerPhone,
        customerEmail: req.customerEmail,
        orderSource: req.orderSource,
        status: 'CONFIRMED' as const,
        paymentStatus: req.paid ? ('PAID' as const) : ('UNPAID' as const),
        paymentMethod: req.paymentMethod,
        subtotal: total,
        shippingPrice: req.shippingPrice,
        discount: req.discount,
        total: total + req.shippingPrice - req.discount,
        shippingStreet: req.shippingStreet,
        shippingCity: req.shippingCity,
        shippingPincode: req.shippingPincode,
        notes: req.notes,
        paid: req.paid,
        delivered: req.delivered,
        items: [],
        createdAt: new Date().toISOString(),
      }).pipe(delay(400));
    }
    return this.http
      .post<Order>(`${this.api}/admin/orders/offline`, req)
      .pipe(map((o) => this.normalizeOrder(o)));
  }

  guestCheckout(req: CheckoutRequest & { customerName: string; customerEmail: string; customerPhone: string }): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.api}/orders/guest-checkout`, req);
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.api}/orders/${id}`).pipe(map((o) => this.normalizeOrder(o)));
  }

  getMyOrders(): Observable<Order[]> {
    return this.http
      .get<Order[]>(`${this.api}/orders/mine`)
      .pipe(map((orders) => orders.map((o) => this.normalizeOrder(o))));
  }

  updateStatus(
    orderId: string,
    status: Order['status'],
    tracking?: { trackingNumber?: string; courierName?: string }
  ): Observable<Order> {
    return this.http
      .patch<Order>(`${this.api}/admin/orders/${orderId}/status`, { status, ...tracking })
      .pipe(map((o) => this.normalizeOrder(o)));
  }

  trackOrder(email: string, orderNumber: string): Observable<OrderTracking> {
    return this.http.post<OrderTracking>(`${this.api}/orders/track`, { email, orderNumber });
  }

  downloadInvoice(orderId: string): Observable<Blob> {
    return this.http.get(`${this.api}/orders/${orderId}/invoice`, { responseType: 'blob' });
  }

  markPaid(orderId: string): Observable<Order> {
    if (this.useMock) {
      const order = MOCK_ORDERS.find((o) => o.id === orderId);
      if (order) {
        order.paid = true;
        order.paymentStatus = 'PAID';
      }
      return of(order!).pipe(delay(200));
    }
    return this.http
      .patch<Order>(`${this.api}/admin/orders/${orderId}/mark-paid`, {})
      .pipe(map((o) => this.normalizeOrder(o)));
  }

  private normalizeOrder(o: Order): Order {
    return { ...o, id: String(o.id) };
  }
}
