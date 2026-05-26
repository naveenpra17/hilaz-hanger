import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { Order, OrderSource } from '../../../core/models/order.model';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex justify-between items-center mb-6">
      <h2 class="font-serif text-xl font-bold">Orders</h2>
      <button type="button" class="btn-gold text-sm" (click)="showModal.set(true)">+ Add Offline Order</button>
    </div>

    <div class="space-y-4">
      @for (o of orders(); track o.id) {
        <article class="section-card">
          <div class="flex justify-between flex-wrap gap-2">
            <div>
              <p class="font-mono text-xs text-gray-500">{{ o.orderNumber }}</p>
              <p class="font-semibold">{{ o.customerName }}</p>
              <p class="text-xs text-gray-500">{{ o.customerPhone }} · {{ o.orderSource }}</p>
            </div>
            <div class="text-right flex flex-col items-end gap-2">
              <p class="font-bold">₹{{ o.total }}</p>
              <span class="text-xs px-2 py-0.5 rounded-full" [class.bg-green-100]="o.paid" [class.text-green-800]="o.paid" [class.bg-orange-100]="!o.paid" [class.text-orange-800]="!o.paid">
                {{ o.paid ? 'Paid' : 'Unpaid' }}
              </span>
              @if (!o.paid) {
                <button type="button" class="text-xs text-burgundy-700 underline" (click)="markPaid(o.id)">Mark paid</button>
              }
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">Status: <strong>{{ o.status }}</strong></p>
          <div class="flex flex-wrap gap-2 mt-3">
            @if (o.status !== 'SHIPPED' && o.status !== 'DELIVERED' && o.status !== 'CANCELLED') {
              <button type="button" class="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg" (click)="setStatus(o.id, 'SHIPPED')">Mark shipped</button>
            }
            @if (o.status === 'SHIPPED') {
              <button type="button" class="text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded-lg" (click)="setStatus(o.id, 'DELIVERED')">Mark delivered</button>
            }
            @if (o.status !== 'CANCELLED' && o.status !== 'DELIVERED') {
              <button type="button" class="text-xs bg-red-100 text-red-800 px-3 py-1.5 rounded-lg" (click)="setStatus(o.id, 'CANCELLED')">Cancel order</button>
            }
          </div>
        </article>
      }
    </div>

    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4 overscroll-contain" (click)="showModal.set(false)">
        <div class="bg-white w-full sm:max-w-lg md:max-w-xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl" (click)="$event.stopPropagation()">
          <div class="bg-burgundy-300 text-white px-4 py-3 flex justify-between items-center rounded-t-2xl">
            <h3 class="font-serif font-semibold">Add New Offline Order</h3>
            <button type="button" class="w-8 h-8 rounded-full bg-white/20" (click)="showModal.set(false)">×</button>
          </div>

          <form (ngSubmit)="createOrder()" class="p-4 space-y-4">
            <section class="bg-pink-50 rounded-xl p-4 space-y-3">
              <h4 class="font-serif text-sm text-burgundy-400">Customer Information</h4>
              <input class="input-field" placeholder="Name *" [(ngModel)]="form.customerName" name="cname" required />
              <input class="input-field" placeholder="Phone *" [(ngModel)]="form.customerPhone" name="cphone" required />
              <input class="input-field" placeholder="Email (optional)" [(ngModel)]="form.customerEmail" name="cemail" />
            </section>

            <section class="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
              <h4 class="font-serif text-sm text-yellow-800 mb-3">Order Source</h4>
              <div class="grid grid-cols-2 gap-2">
                @for (src of sources; track src) {
                  <label class="flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm" [class.border-pink-400]="form.orderSource === src" [class.bg-green-50]="form.orderSource === src">
                    <input type="radio" name="source" [value]="src" [(ngModel)]="form.orderSource" />
                    {{ src }}
                  </label>
                }
              </div>
            </section>

            <section>
              <h4 class="font-serif font-bold text-sm mb-2">Order Items</h4>
              <input class="input-field mb-3" placeholder="Search products by name or brand..." [(ngModel)]="itemSearch" name="search" />
              @for (item of lineItems; track item.variantId) {
                <div class="flex gap-3 p-3 border border-pink-100 rounded-xl mb-2">
                  <img [src]="item.image" class="w-14 h-14 rounded object-cover" alt="" />
                  <div class="flex-1 text-sm">
                    <p class="font-semibold">{{ item.name }}</p>
                    <p class="text-gray-500">₹{{ item.price }} each</p>
                  </div>
                  <input type="number" class="w-12 input-field text-center p-1" [(ngModel)]="item.qty" [name]="'q'+item.variantId" min="1" />
                </div>
              }
              <button type="button" class="text-xs text-burgundy-600" (click)="addFromCatalog()">+ Add first catalog product</button>
            </section>

            <section>
              <h4 class="font-serif font-bold text-sm mb-2">Shipping Address</h4>
              <input class="input-field mb-2" placeholder="Address *" [(ngModel)]="form.shippingStreet" name="street" />
              <div class="grid grid-cols-3 gap-2">
                <input class="input-field col-span-2" placeholder="City" [(ngModel)]="form.shippingCity" name="city" />
                <input class="input-field" placeholder="Pincode" [(ngModel)]="form.shippingPincode" name="pin" />
              </div>
            </section>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs">Shipping Price</label>
                <input class="input-field" type="number" [(ngModel)]="form.shippingPrice" name="ship" />
              </div>
              <div>
                <label class="text-xs">Discount (₹)</label>
                <input class="input-field" type="number" [(ngModel)]="form.discount" name="disc" />
              </div>
            </div>

            <select class="input-field" [(ngModel)]="form.paymentMethod" name="pay">
              <option value="UPI">UPI</option>
              <option value="COD">Cash on Delivery</option>
              <option value="CASH">Cash</option>
            </select>

            <div class="flex gap-4 text-sm">
              <label class="flex items-center gap-2"><input type="checkbox" [(ngModel)]="form.paid" name="paid" /> Paid</label>
              <label class="flex items-center gap-2"><input type="checkbox" [(ngModel)]="form.delivered" name="del" /> Delivered</label>
            </div>

            <textarea class="input-field" rows="2" placeholder="Additional notes..." [(ngModel)]="form.notes" name="notes"></textarea>

            <div class="bg-pink-50 rounded-xl p-4 text-sm space-y-1">
              <div class="flex justify-between"><span>Items Total</span><span>₹{{ itemsTotal().toFixed(2) }}</span></div>
              <div class="flex justify-between"><span>Shipping</span><span>₹{{ form.shippingPrice.toFixed(2) }}</span></div>
              <div class="flex justify-between font-bold text-base border-t border-pink-200 pt-2">
                <span>Total</span><span>₹{{ (itemsTotal() + form.shippingPrice - form.discount).toFixed(2) }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 pb-4">
              <button type="submit" class="bg-burgundy-300 text-white py-3 rounded-xl font-medium">Create Order</button>
              <button type="button" class="border py-3 rounded-xl" (click)="showModal.set(false)">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class OrdersComponent implements OnInit {
  readonly orders = signal<Order[]>([]);
  readonly showModal = signal(false);
  readonly sources: OrderSource[] = ['WHATSAPP', 'PHONE', 'FRIEND', 'INSTAGRAM', 'WALKIN', 'OTHER'];
  itemSearch = '';

  form = {
    customerName: 'Ajitha',
    customerPhone: '',
    customerEmail: '',
    orderSource: 'INSTAGRAM' as OrderSource,
    shippingStreet: '',
    shippingCity: 'Coimbatore',
    shippingPincode: '',
    shippingPrice: 0,
    discount: 0,
    paymentMethod: 'COD',
    paid: false,
    delivered: false,
    notes: '',
  };

  lineItems: { variantId: string; name: string; price: number; image: string; qty: number }[] = [];
  private catalog: Product[] = [];

  constructor(
    private orderService: OrderService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe((o) => this.orders.set(o));
    this.productService.getProducts({ size: 20 }).subscribe((page) => {
      this.catalog = page.content;
    });
  }

  addFromCatalog(): void {
    const p = this.catalog[0];
    const v = p?.variants?.[0];
    if (!p || !v?.id) {
      alert('No products with stock variants in catalog. Create a product in Admin → Products first.');
      return;
    }
    if (!this.lineItems.find((i) => i.variantId === v.id)) {
      this.lineItems.push({
        variantId: v.id,
        name: `${p.name} (${v.size})`,
        price: p.price,
        image: p.images[0]?.url ?? '',
        qty: 1,
      });
    }
  }

  markPaid(orderId: string): void {
    this.orderService.markPaid(orderId).subscribe({
      next: (updated) => {
        this.orders.update((list) => list.map((o) => (o.id === updated.id ? updated : o)));
      },
    });
  }

  setStatus(orderId: string, status: Order['status']): void {
    const label = status === 'CANCELLED' ? 'cancel' : status.toLowerCase();
    if (!confirm(`Mark this order as ${label}?`)) return;
    let tracking: { trackingNumber?: string; courierName?: string } | undefined;
    if (status === 'SHIPPED') {
      const trackingNumber = prompt('AWB / tracking number (optional):') ?? undefined;
      const courierName = prompt('Courier name e.g. Delhivery, Blue Dart (optional):') ?? undefined;
      if (trackingNumber || courierName) {
        tracking = { trackingNumber: trackingNumber || undefined, courierName: courierName || undefined };
      }
    }
    this.orderService.updateStatus(orderId, status, tracking).subscribe({
      next: (updated) => {
        this.orders.update((list) => list.map((o) => (o.id === updated.id ? updated : o)));
      },
      error: (err) => alert(err?.error?.message ?? 'Status update failed'),
    });
  }

  itemsTotal(): number {
    return this.lineItems.reduce((s, i) => s + i.price * i.qty, 0);
  }

  createOrder(): void {
    this.orderService
      .createOfflineOrder({
        ...this.form,
        items: this.lineItems.map((i) => ({ variantId: i.variantId, quantity: i.qty })),
      })
      .subscribe((order) => {
        this.orders.update((list) => [order, ...list]);
        this.showModal.set(false);
      });
  }
}
