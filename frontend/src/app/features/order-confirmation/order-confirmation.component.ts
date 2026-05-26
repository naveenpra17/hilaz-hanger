import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreConfigService } from '../../core/services/store-config.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-container-narrow page-section pb-24 text-center">
      <div class="w-16 h-16 rounded-full bg-green-100 text-green-700 text-3xl flex items-center justify-center mx-auto mb-4">✓</div>
      <h1 class="font-serif text-2xl font-bold text-burgundy-900 mb-2">Thank you for your order!</h1>
      <p class="text-gray-600 mb-1">Order number</p>
      <p class="font-mono text-lg font-bold text-burgundy-800 mb-6">{{ orderNumber }}</p>

      <p class="text-sm text-gray-600 mb-6 max-w-md mx-auto">
        @if (guest) {
          We sent confirmation details to your email. Save your order number to track delivery.
        } @else {
          View order status and download your tax invoice anytime from My Orders.
        }
      </p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center mb-8">
        @if (auth.isLoggedIn()) {
          <a routerLink="/orders" class="btn-primary">My orders</a>
        } @else {
          <a routerLink="/track-order" [queryParams]="{ order: orderNumber, email: email }" class="btn-primary">Track order</a>
          <a routerLink="/register" class="btn-secondary">Create account</a>
        }
        <a routerLink="/shop" class="btn-secondary">Continue shopping</a>
      </div>

      <p class="text-xs text-gray-500 mb-2">Need help?</p>
      <a [href]="store.whatsappUrl('Hi, I placed order ' + orderNumber)" target="_blank" rel="noopener" class="text-sm text-[#25D366] font-medium underline">
        Chat on WhatsApp
      </a>
    </div>
  `,
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  readonly store = inject(StoreConfigService);
  readonly auth = inject(AuthService);

  orderNumber = '';
  email = '';
  guest = true;

  ngOnInit(): void {
    this.orderNumber = this.route.snapshot.queryParamMap.get('order') ?? '';
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.guest = this.route.snapshot.queryParamMap.get('guest') === '1' || !this.auth.isLoggedIn();
  }
}
