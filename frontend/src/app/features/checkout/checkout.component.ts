import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { CouponService } from '../../core/services/coupon.service';
import { StoreService } from '../../core/services/store.service';
import { AddressService } from '../../core/services/address.service';
import { SavedAddress } from '../../core/models/address.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, RouterLink, LoadingSpinnerComponent],
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
        @if (auth.isLoggedIn() && addresses().length > 0) {
          <section class="mb-6">
            <h2 class="font-serif font-bold mb-3">Saved address</h2>
            <select class="input-field" [(ngModel)]="selectedAddressId" name="addr" (ngModelChange)="onAddressPick($event)">
              @for (a of addresses(); track a.id) {
                <option [value]="a.id">{{ a.label }} — {{ a.city }}</option>
              }
            </select>
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
          <h2 class="font-serif font-bold mb-2">Secure prepaid payment</h2>
          <p class="text-xs text-gray-600 mb-3">
            Cash on Delivery (COD) is not available. Pay securely with UPI, cards, or netbanking via Razorpay.
          </p>
          <label class="block text-sm font-medium mb-2">Payment method</label>
          <select class="input-field" [(ngModel)]="paymentMethod">
            <option value="UPI">UPI</option>
            <option value="CARD">Credit / Debit Card</option>
          </select>
          <div class="flex flex-wrap gap-2 mt-4 text-xs text-gray-600">
            <span class="px-2 py-1 bg-green-50 text-green-800 rounded border border-green-200">🔒 SSL secured</span>
            <span class="px-2 py-1 bg-blue-50 text-blue-800 rounded border border-blue-200">Razorpay</span>
            <span class="px-2 py-1 bg-burgundy-50 text-burgundy-800 rounded border border-burgundy-200">Prepaid only</span>
          </div>
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
          <div class="flex justify-between text-gray-600"><span>GST (18%)</span><span>₹{{ estimatedGst() }}</span></div>
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
          class="btn-primary w-full flex items-center justify-center gap-2"
          [disabled]="loading()"
          (click)="placeOrder()"
        >
          @if (loading()) {
            <app-loading-spinner size="sm" [inline]="true" />
            <span>Processing payment...</span>
          } @else {
            <span>Pay securely with Razorpay</span>
          }
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
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly couponService = inject(CouponService);
  private readonly storeService = inject(StoreService);
  private readonly addressService = inject(AddressService);

  readonly addresses = signal<SavedAddress[]>([]);
  selectedAddressId = '';
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
    if (this.auth.isLoggedIn()) {
      const u = this.auth.user();
      if (u?.fullName) this.guestName = u.fullName;
      if (u?.email) this.guestEmail = u.email ?? '';
      if (u?.phone) this.guestPhone = u.phone ?? '';
      this.addressService.list().subscribe((list) => {
        this.addresses.set(list);
        const def = list.find((a) => a.defaultAddress) ?? list[0];
        if (def) {
          this.selectedAddressId = def.id;
          this.applyAddress(def);
        }
      });
    }
  }

  onAddressPick(id: string): void {
    const addr = this.addresses().find((a) => a.id === id);
    if (addr) this.applyAddress(addr);
  }

  private applyAddress(a: SavedAddress): void {
    this.street = a.streetLine;
    this.city = a.city;
    this.pincode = a.pincode;
    if (a.fullName) this.guestName = a.fullName;
    if (a.phone) this.guestPhone = a.phone;
  }

  estimatedGst(): number {
    const taxable = Math.max(0, this.cart.subtotal() - this.couponDiscount());
    return Math.round(taxable * 0.18 * 100) / 100;
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
    const taxable = Math.max(0, this.cart.subtotal() - this.couponDiscount());
    return Math.max(0, taxable + this.estimatedGst() + this.shippingPrice);
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
          this.complete(res.order.orderNumber, res.order.id);
          return;
        }
        if (!res.razorpayOrderId || !this.paymentService.isConfigured(res.razorpayKeyId)) {
          this.error.set(
            'Razorpay is not configured on API. Ask admin to set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Render.'
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
            customerName: this.auth.user()?.fullName ?? this.guestName ?? 'Customer',
            customerEmail: this.auth.user()?.email ?? this.guestEmail,
            customerPhone: this.auth.user()?.phone ?? this.guestPhone,
            onSuccess: (rzpRes) => {
              this.orderService
                .verifyPayment({
                  orderId: res.order.id,
                  razorpayOrderId: rzpRes.razorpay_order_id,
                  razorpayPaymentId: rzpRes.razorpay_payment_id,
                  razorpaySignature: rzpRes.razorpay_signature,
                })
                .subscribe({
                  next: () => this.complete(res.order.orderNumber, res.order.id),
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
        const msg =
          err?.status === 401
            ? 'Session expired. Please log in again, or continue as guest checkout.'
            : err?.error?.message ?? 'Checkout failed. Is the API running?';
        this.error.set(msg);
        this.loading.set(false);
      },
    });
  }

  private complete(orderNumber: string, orderId?: string): void {
    this.cart.clear();
    this.loading.set(false);
    const guest = !this.auth.isLoggedIn();
    this.router.navigate(['/order-confirmation'], {
      queryParams: {
        order: orderNumber,
        email: guest ? this.guestEmail : this.auth.user()?.email,
        guest: guest ? '1' : '0',
        id: orderId,
      },
    });
  }
}
