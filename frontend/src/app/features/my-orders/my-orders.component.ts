import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Order } from '../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [RouterLink, DatePipe, LoadingSpinnerComponent],
  template: `
    <div class="page-container page-section max-w-3xl mx-auto pb-28 lg:pb-10">
      <h1 class="font-serif text-2xl font-bold text-burgundy-900 mb-6">My Orders</h1>

      @if (!auth.isLoggedIn()) {
        <p class="text-gray-600 text-center py-8">
          <a routerLink="/login" class="text-burgundy-700 font-medium underline">Log in</a> to see your orders.
        </p>
      } @else if (loading()) {
        <app-loading-spinner message="Loading orders..." />
      } @else if (error()) {
        <p class="text-red-600 text-sm text-center py-8">{{ error() }}</p>
      } @else if (orders().length === 0) {
        <p class="text-gray-500 text-center py-8">No orders yet.</p>
        <a routerLink="/shop" class="btn-primary block text-center max-w-xs mx-auto">Start Shopping</a>
      } @else {
        <div class="space-y-4">
          @for (o of orders(); track o.id) {
            <article class="section-card">
              <div class="flex justify-between flex-wrap gap-2 mb-3">
                <div>
                  <p class="font-mono text-xs text-gray-500">{{ o.orderNumber }}</p>
                  <p class="text-xs text-gray-500">{{ o.createdAt | date: 'medium' }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-burgundy-900">₹{{ o.total }}</p>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-burgundy-100 text-burgundy-800">{{ o.status }}</span>
                </div>
              </div>
              <ul class="text-sm text-gray-600 space-y-1 border-t border-burgundy-50 pt-3">
                @for (item of o.items; track item.id) {
                  <li class="flex justify-between gap-2">
                    <span>{{ item.productName }} @if (item.size) { ({{ item.size }}) } × {{ item.quantity }}</span>
                    <span>₹{{ item.lineTotal }}</span>
                  </li>
                }
              </ul>
              @if (o.couponCode) {
                <p class="text-xs text-green-700 mt-2">Coupon: {{ o.couponCode }} (−₹{{ o.discount }})</p>
              }
              <p class="text-xs text-gray-500 mt-2">
                Ship to: {{ o.shippingStreet }}, {{ o.shippingCity }} — {{ o.shippingPincode }}
              </p>
              <a [routerLink]="['/orders', o.id]" class="text-xs text-burgundy-700 underline mt-2 inline-block">View details →</a>
            </article>
          }
        </div>
      }
    </div>
  `,
})
export class MyOrdersComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly orderService = inject(OrderService);

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.loading.set(false);
      return;
    }
    this.orderService.getMyOrders().subscribe({
      next: (list) => {
        this.orders.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load orders.');
        this.loading.set(false);
      },
    });
  }
}
