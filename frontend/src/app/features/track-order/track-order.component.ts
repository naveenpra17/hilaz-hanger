import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { OrderTracking } from '../../core/models/order.model';
import { StoreConfigService } from '../../core/services/store-config.service';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  template: `
    <div class="page-container-narrow page-section pb-20">
      <h1 class="font-serif text-2xl font-bold text-burgundy-900 mb-2">Track your order</h1>
      <p class="text-sm text-gray-600 mb-6">Like Flipkart / Amazon — enter the email and order number from your confirmation.</p>

      <form class="section-card space-y-3 mb-6" (ngSubmit)="track()">
        <input class="input-field" type="email" placeholder="Email used at checkout" [(ngModel)]="email" name="email" required />
        <input class="input-field" placeholder="Order number e.g. HH-ABC12345" [(ngModel)]="orderNumber" name="order" required />
        <button type="submit" class="btn-primary w-full" [disabled]="loading()">Track</button>
      </form>

      @if (error()) {
        <p class="text-red-600 text-sm mb-4">{{ error() }}</p>
      }

      @if (result(); as r) {
        <div class="section-card space-y-4">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-mono font-bold">{{ r.orderNumber }}</p>
              <p class="text-xs text-gray-500">{{ r.createdAt | date: 'medium' }}</p>
            </div>
            <span class="text-xs px-2 py-1 rounded-full bg-burgundy-100 uppercase">{{ r.status }}</span>
          </div>

          <ol class="space-y-2 text-sm">
            @for (step of steps; track step.key) {
              <li class="flex items-center gap-3" [class.opacity-40]="!step.done(r)">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  [class.bg-green-600]="step.done(r)" [class.text-white]="step.done(r)"
                  [class.bg-gray-200]="!step.done(r)">{{ step.done(r) ? '✓' : '·' }}</span>
                <span>{{ step.label }}</span>
              </li>
            }
          </ol>

          @if (r.trackingNumber) {
            <div class="bg-cream-dark rounded-xl p-3 text-sm">
              <p class="font-medium">Shipment tracking</p>
              <p>{{ r.courierName ?? 'Courier' }}: <span class="font-mono">{{ r.trackingNumber }}</span></p>
            </div>
          }

          <a [href]="store.whatsappUrl('Track order ' + r.orderNumber)" target="_blank" rel="noopener" class="text-sm text-[#25D366] underline block">
            Ask us on WhatsApp
          </a>
        </div>
      }

      <a routerLink="/shop" class="text-sm text-burgundy-600 underline mt-6 inline-block">← Back to shop</a>
    </div>
  `,
})
export class TrackOrderComponent implements OnInit {
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);
  readonly store = inject(StoreConfigService);

  email = '';
  orderNumber = '';
  readonly loading = signal(false);
  readonly error = signal('');
  readonly result = signal<OrderTracking | null>(null);

  readonly steps = [
    { key: 'placed', label: 'Order placed', done: (r: OrderTracking) => true },
    { key: 'confirmed', label: 'Confirmed / paid', done: (r: OrderTracking) => r.paid },
    { key: 'shipped', label: 'Shipped', done: (r: OrderTracking) => r.status === 'SHIPPED' || r.status === 'DELIVERED' },
    { key: 'delivered', label: 'Delivered', done: (r: OrderTracking) => r.delivered || r.status === 'DELIVERED' },
  ];

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.orderNumber = this.route.snapshot.queryParamMap.get('order') ?? '';
    if (this.email && this.orderNumber) {
      this.track();
    }
  }

  track(): void {
    this.loading.set(true);
    this.error.set('');
    this.result.set(null);
    this.orderService.trackOrder(this.email.trim(), this.orderNumber.trim()).subscribe({
      next: (r) => {
        this.result.set(r);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Order not found. Check email and order number.');
        this.loading.set(false);
      },
    });
  }
}
