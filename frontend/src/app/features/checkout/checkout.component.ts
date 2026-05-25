import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page-container-narrow page-section pb-28 lg:pb-10">
      <h1 class="font-serif text-2xl font-bold mb-6">Checkout</h1>

      @if (cart.items().length === 0) {
        <p class="text-gray-500 text-center py-8">Your cart is empty.</p>
        <a routerLink="/shop" class="btn-primary block text-center">Continue Shopping</a>
      } @else {
        <section class="mb-6">
          <h2 class="font-serif font-bold mb-3">Shipping Address</h2>
          <input class="input-field mb-3" placeholder="Street address *" [(ngModel)]="street" required />
          <div class="grid grid-cols-1 xs:grid-cols-3 gap-3">
            <input class="input-field xs:col-span-2" placeholder="City *" [(ngModel)]="city" />
            <input class="input-field" placeholder="Pincode *" [(ngModel)]="pincode" />
          </div>
        </section>

        <section class="mb-6">
          <label class="block text-sm font-medium mb-2">Payment Method</label>
          <select class="input-field" [(ngModel)]="paymentMethod">
            <option value="UPI">UPI (Razorpay)</option>
            <option value="CARD">Card (Razorpay)</option>
            <option value="COD">Cash on Delivery</option>
          </select>
        </section>

        <div class="bg-pink-50 rounded-2xl p-4 space-y-2 text-sm mb-6">
          <div class="flex justify-between"><span>Items Total</span><span>₹{{ cart.subtotal() }}</span></div>
          <div class="flex justify-between"><span>Shipping</span><span>₹{{ shippingPrice }}</span></div>
          <div class="flex justify-between font-bold text-base border-t border-pink-200 pt-2">
            <span>Total</span><span>₹{{ cart.subtotal() + shippingPrice }}</span>
          </div>
        </div>

        @if (error()) {
          <p class="text-red-600 text-sm mb-4">{{ error() }}</p>
        }
        @if (success()) {
          <p class="text-green-700 text-sm mb-4 text-center">{{ success() }}</p>
        }

        <button
          type="button"
          class="btn-primary w-full"
          [disabled]="loading()"
          (click)="placeOrder()"
        >
          {{ loading() ? 'Processing...' : paymentMethod === 'COD' ? 'Place Order' : 'Pay with Razorpay' }}
        </button>
      }
      <a routerLink="/cart" class="block text-center text-sm text-gray-500 mt-4">← Back to cart</a>
    </div>
  `,
})
export class CheckoutComponent {
  readonly cart = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  street = '';
  city = 'Coimbatore';
  pincode = '';
  paymentMethod = 'UPI';
  shippingPrice = 0;
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  placeOrder(): void {
    if (!this.street || !this.city || !this.pincode) {
      this.error.set('Please fill in your shipping address.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    const req = {
      items: this.cart.items().map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      shippingStreet: this.street,
      shippingCity: this.city,
      shippingPincode: this.pincode,
      shippingPrice: this.shippingPrice,
      discount: 0,
      paymentMethod: this.paymentMethod,
    };

    this.orderService.checkout(req).subscribe({
      next: async (res) => {
        if (!res.requiresPayment) {
          this.complete(res.order.orderNumber);
          return;
        }
        if (!res.razorpayOrderId || !this.paymentService.isConfigured(res.razorpayKeyId)) {
          this.error.set(
            'Razorpay is not configured. Set RAZORPAY_KEY_ID in backend and razorpayKey in frontend environment.'
          );
          this.loading.set(false);
          return;
        }
        try {
          await this.paymentService.loadScript();
          this.paymentService.openCheckout({
            key: res.razorpayKeyId!,
            amountPaise: res.amountPaise ?? 0,
            orderId: res.razorpayOrderId!,
            orderNumber: res.order.orderNumber,
            customerName: this.auth.user()?.fullName ?? 'Customer',
            customerEmail: this.auth.user()?.email,
            customerPhone: this.auth.user()?.phone,
            onSuccess: (rzpRes) => {
              this.orderService
                .verifyPayment({
                  orderId: res.order.id,
                  razorpayOrderId: rzpRes.razorpay_order_id,
                  razorpayPaymentId: rzpRes.razorpay_payment_id,
                  razorpaySignature: rzpRes.razorpay_signature,
                })
                .subscribe({
                  next: () => this.complete(res.order.orderNumber),
                  error: () => {
                    this.error.set('Payment received but verification failed. Contact support.');
                    this.loading.set(false);
                  },
                });
            },
            onDismiss: () => {
              this.loading.set(false);
              this.error.set('Payment cancelled.');
            },
          });
          this.loading.set(false);
        } catch {
          this.error.set('Could not load payment gateway.');
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Checkout failed. Is the API running?');
        this.loading.set(false);
      },
    });
  }

  private complete(orderNumber: string): void {
    this.cart.clear();
    this.success.set(`Order ${orderNumber} placed successfully!`);
    this.loading.set(false);
    setTimeout(() => this.router.navigate(['/']), 2500);
  }
}
