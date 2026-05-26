import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Product } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <div class="page-container page-section pb-20">
      <h1 class="font-serif text-2xl font-bold text-burgundy-900 mb-2">Saved Items</h1>
      @if (!auth.isLoggedIn()) {
        <p class="text-gray-600 mb-6"><a routerLink="/login" class="text-burgundy-700 underline">Log in</a> to save favourites.</p>
      } @else if (loading()) {
        <p class="text-gray-500">Loading...</p>
      } @else if (items().length === 0) {
        <p class="text-gray-500 mt-2 mb-6">Your wishlist is empty.</p>
        <a routerLink="/shop" class="btn-primary inline-block">Browse Shop</a>
      } @else {
        <div class="responsive-grid-products mt-6">
          @for (p of items(); track p.id) {
            <app-product-card [product]="p" />
          }
        </div>
      }
    </div>
  `,
})
export class SavedComponent implements OnInit {
  readonly auth = inject(AuthService);
  private wishlist = inject(WishlistService);
  readonly items = signal<Product[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.loading.set(false);
      return;
    }
    this.wishlist.list().subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
