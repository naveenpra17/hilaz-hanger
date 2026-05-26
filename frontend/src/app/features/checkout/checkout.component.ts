import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { CouponService } from '../../core/services/coupon.service';
import { StoreService } from '../../core/services/store.service';

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
        @if (!auth.isLoggedIn()) {
          <section class="section-card mb-6 space-y-3">
            <h2 class="font-serif font-bold">Guest checkout</h2>
            <p class="text-xs text-gray-500">Or <a routerLink="/login" class="text-burgundy-700 underline">log in</a> for faster checkout.</p>
            <input class="input-field" placeholder="Full name *" [(ngModel)]="guestName" name="gname" />
            <input class="input-field" type="email" placeholder="Email *" [(ngModel)]="guestEmail" name="gemail" />
            <input class="input-field" placeholder="Phone *" [(ngModel)]="guestPhone" name="gphone" />
          </section>
        }
        <section class="mb-6">
          <h2 class="font-serif font-bold mb-3">Shipping Address</h2>
          <input class="input-field mb-3" placeholder="Street address *" [(ngModel)]="street" required />
          <div class="grid grid-cols-1 xs:grid-cols-3 gap-3">
            <input class="input-field xs:col-span-2" placeholder="City *" [(ngModel)]="city" />
            <input class="input-field" placeholder="Pincode *" [(ngModel)]="pincode" />
          </div>
        </section>

        <section class="mb-6">
          <h2 class="font-serif font-bold mb-3">Promo code</h2>
          <div class="flex gap-2">
            <input class="input-field flex-1 uppercase" placeholder="e.g. WELCOME10" [(ngModel)]="couponCode" name="coupon" />
            <button type="button" class="btn-secondary shrink-0 px-4" (click)="applyCoupon()" [disabled]="couponLoading()">
              {{ couponLoading() ? '...' : 'Apply' }}
            </button>
          </div>
          @if (couponMessage()) {
            <p class="text-xs mt-2" [class.text-green-700]="couponDiscount() > 0" [class.text-red-600]="couponDiscount() === 0">{{ couponMessage() }}</p>
          }
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
          <div class="flex justify-between"><span>Shipping</span><span>{{ shippingPrice === 0 ? 'FREE' : '₹' + shippingPrice }}</span></div>
          @if (shippingNote()) {
            <p class="text-xs text-gray-500">{{ shippingNote() }}</p>
          }
          @if (couponDiscount() > 0) {
            <div class="flex justify-between text-green-700"><span>Discount</span><span>−₹{{ couponDiscount() }}</span></div>
          }
          <div class="flex justify-between font-bold text-base border-t border-pink-200 pt-2">
            <span>Total</span><span>₹{{ orderTotal() }}</span>
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
export class CheckoutComponent implements OnInit {
  readonly cart = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly couponService = inject(CouponService);
  private readonly storeService = inject(StoreService);

  guestName = '';
  guestEmail = '';
  guestPhone = '';
  street = '';
  couponCode = '';
  readonly couponDiscount = signal(0);
  readonly couponMessage = signal('');
  readonly couponLoading = signal(false);
  appliedCouponCode = '';
  city = 'Coimbatore';
  pincode = '';
  paymentMethod = 'UPI';
  shippingPrice = 0;
  readonly shippingNote = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  ngOnInit(): void {
    this.refreshShipping();
  }

  refreshShipping(): void {
    this.storeService.shippingQuote(this.cart.subtotal()).subscribe({
      next: (q) => {
        this.shippingPrice = q.shippingPrice;
        this.shippingNote.set(q.description);
      },
    });
  }

  orderTotal(): number {
    return Math.max(0, this.cart.subtotal() + this.shippingPrice - this.couponDiscount());
  }

  applyCoupon(): void {
    const code = this.couponCode.trim();
    if (!code) return;
    this.couponLoading.set(true);
    this.couponMessage.set('');
    this.couponService.validate(code, this.cart.subtotal()).subscribe({
      next: (res) => {
        this.couponLoading.set(false);
        this.couponMessage.set(res.message);
        if (res.valid) {
          this.couponDiscount.set(res.discountAmount);
          this.appliedCouponCode = code.toUpperCase();
        } else {
          this.couponDiscount.set(0);
          this.appliedCouponCode = '';
        }
      },
      error: () => {
        this.couponLoading.set(false);
        this.couponMessage.set('Could not validate coupon.');
      },
    });
  }

  placeOrder(): void {
    if (!this.street || !this.city || !this.pincode) {
      this.error.set('Please fill in your shipping address.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    const base = {
      items: this.cart.items().map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      shippingStreet: this.street,
      shippingCity: this.city,
      shippingPincode: this.pincode,
      shippingPrice: this.shippingPrice,
      discount: this.couponDiscount(),
      couponCode: this.appliedCouponCode || undefined,
      paymentMethod: this.paymentMethod,
    };

    const order$ = this.auth.isLoggedIn()
      ? this.orderService.checkout(base)
      : this.orderService.guestCheckout({
          ...base,
          customerName: this.guestName,
          customerEmail: this.guestEmail,
          customerPhone: this.guestPhone,
        });

    if (!this.auth.isLoggedIn() && (!this.guestName || !this.guestEmail || !this.guestPhone)) {
      this.error.set('Please fill in guest contact details.');
      this.loading.set(false);
      return;
    }

    order$.subscribe({
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
    setTimeout(() => this.router.navigate(['/orders']), 2500);
  }
}
