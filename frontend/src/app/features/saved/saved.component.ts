import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Product } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, LoadingSpinnerComponent],
  template: `
    <div class="page-container page-section pb-20">
      <h1 class="font-serif text-2xl font-bold text-burgundy-900 mb-2">Saved Items</h1>
      @if (!auth.isLoggedIn()) {
        <p class="text-gray-600 mb-6"><a routerLink="/login" class="text-burgundy-700 underline">Log in</a> to save favourites.</p>
      } @else if (loading()) {
        <app-loading-spinner message="Loading saved items..." />
      } @else if (items().length === 0) {
        <p class="text-gray-500 mt-2 mb-6">Your wishlist is empty.</p>
        <a routerLink="/shop" class="btn-primary inline-block">Browse Shop</a>
      } @else {
        <div class="responsive-grid-products mt-6">
          @for (p of items(); track p.id) {
            <div class="relative">
              <app-product-card [product]="p" />
              <button type="button" class="absolute top-2 right-2 bg-white/90 text-xs px-2 py-1 rounded-lg shadow" (click)="remove(p.id)">Remove</button>
            </div>
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

  remove(productId: string): void {
    this.wishlist.remove(productId).subscribe(() => {
      this.items.update((list) => list.filter((p) => p.id !== productId));
    });
  }
}
