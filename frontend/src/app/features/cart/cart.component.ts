import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-container-narrow page-section">
      <h1 class="font-serif text-2xl font-bold text-burgundy-900 mb-6">Your Cart</h1>

      @if (cart.items().length === 0) {
        <p class="text-gray-500 text-center py-12">Your cart is empty.</p>
        <a routerLink="/shop" class="btn-primary block text-center max-w-xs mx-auto">Continue Shopping</a>
      } @else {
        <div class="space-y-4">
          @for (item of cart.items(); track item.id) {
            <div class="section-card flex gap-4">
              @if (item.imageUrl) {
                <img [src]="item.imageUrl" [alt]="item.productName" class="w-20 h-24 object-cover rounded-lg" />
              }
              <div class="flex-1">
                <h3 class="font-serif font-semibold text-sm">{{ item.productName }}</h3>
                <p class="text-xs text-gray-500">{{ item.size }} @if (item.colorName) { · {{ item.colorName }} }</p>
                <p class="font-bold text-burgundy-800 mt-1">₹{{ item.unitPrice }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <button type="button" class="w-8 h-8 border rounded" (click)="cart.updateQuantity(item.id, item.quantity - 1)">−</button>
                  <span>{{ item.quantity }}</span>
                  <button type="button" class="w-8 h-8 border rounded" (click)="cart.updateQuantity(item.id, item.quantity + 1)">+</button>
                  <button type="button" class="text-red-500 text-xs ml-auto" (click)="cart.removeItem(item.id)">Remove</button>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="bg-pink-50 rounded-2xl p-4 mt-6 space-y-2 text-sm">
          <div class="flex justify-between"><span>Items Total</span><span class="font-semibold">₹{{ cart.subtotal() }}</span></div>
          <div class="flex justify-between font-bold text-base border-t border-pink-200 pt-2">
            <span>Total</span><span>₹{{ cart.subtotal() }}</span>
          </div>
        </div>

        <a routerLink="/checkout" class="btn-primary block text-center mt-6">Proceed to Checkout</a>
      }
    </div>
  `,
})
export class CartComponent {
  readonly cart = inject(CartService);
}
