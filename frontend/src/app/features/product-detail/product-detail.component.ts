import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Product, ProductColor } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ReviewService, Review } from '../../core/services/review.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/services/auth.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent],
  template: `
    @if (product(); as p) {
      <div class="page-container page-section max-w-6xl">
        <a routerLink="/shop" class="text-sm text-burgundy-600 mb-4 inline-flex items-center min-h-[44px]">← Back</a>

        <div class="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-12 lg:items-start">
        <div class="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-carousel mb-4 lg:mb-0 lg:sticky lg:top-24">
          <img [src]="currentImage()" [alt]="p.name" class="w-full aspect-square sm:aspect-[4/5] lg:aspect-square object-cover" />
          @for (label of p.labels; track label) {
            <span class="absolute top-3 right-3 bg-burgundy-800 text-white text-xs font-bold px-2 py-1 rounded uppercase">{{ label }}</span>
          }
          <span class="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">{{ imageIndex() + 1 }} / {{ p.images.length }}</span>
          <button type="button" class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80" (click)="prevImage(p)">‹</button>
          <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80" (click)="nextImage(p)">›</button>
        </div>

        @if (p.images.length > 1) {
          <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
            <span class="text-xs text-gray-500 self-center mr-1">GALLERY</span>
            @for (img of p.images; track $index) {
              <button type="button" (click)="imageIndex.set($index)" class="w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2" [class.border-burgundy-800]="$index === imageIndex()" [class.border-transparent]="$index !== imageIndex()">
                <img [src]="img.url" class="w-full h-full object-cover" alt="" />
              </button>
            }
          </div>
        }

        <div class="lg:pt-0">
        <h1 class="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-burgundy-900">{{ p.name }}</h1>
        <div class="flex items-baseline gap-3 mt-2">
          <span class="text-2xl font-bold">₹{{ p.price }}</span>
          @if (p.compareAtPrice) {
            <span class="text-gray-400 line-through">₹{{ p.compareAtPrice }}</span>
          }
        </div>
        <p class="text-sm text-gray-500 mt-1">★★★★★ ({{ p.reviewCount ?? 0 }} reviews)</p>

        @if (p.colors.length) {
          <div class="mt-6">
            <p class="text-xs font-semibold tracking-wider text-gray-600 mb-2">COLOR</p>
            <div class="flex gap-4 flex-wrap">
              @for (c of p.colors; track c.name) {
                <button type="button" (click)="selectedColor.set(c)" class="flex flex-col items-center gap-1">
                  <span
                    class="w-10 h-10 rounded-full border-2"
                    [style.background]="c.hex"
                    [class.border-burgundy-800]="selectedColor()?.name === c.name"
                    [class.border-gray-200]="selectedColor()?.name !== c.name"
                  ></span>
                  <span class="text-[10px] text-gray-600">{{ c.name }}</span>
                </button>
              }
            </div>
          </div>
        }

        @if (p.description) {
          <p class="text-sm text-gray-600 mt-4 leading-relaxed">{{ p.description }}</p>
        }

        <div class="mt-6">
          <div class="flex justify-between items-center mb-2">
            <p class="text-xs font-semibold tracking-wider text-gray-600">SIZE</p>
            <a href="#" class="text-xs text-burgundy-600 underline">Size Chart</a>
          </div>
          <div class="flex flex-wrap gap-2">
            @for (size of p.sizes; track size) {
              <button
                type="button"
                (click)="selectedSize.set(size)"
                class="min-w-[44px] h-11 px-3 rounded-lg border font-medium text-sm transition-colors"
                [class.bg-burgundy-800]="selectedSize() === size"
                [class.text-white]="selectedSize() === size"
                [class.border-burgundy-200]="selectedSize() !== size"
              >{{ size }}</button>
            }
          </div>
        </div>

        <div class="flex items-center gap-4 mt-6">
          <div class="flex items-center border border-burgundy-200 rounded-lg">
            <button type="button" class="w-10 h-10 min-h-[44px]" (click)="decreaseQty()">−</button>
            <span class="w-10 text-center font-medium">{{ qty() }}</span>
            <button type="button" class="w-10 h-10 min-h-[44px]" (click)="increaseQty()">+</button>
          </div>
          @if (lowStock()) {
            <span class="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded-full">Only {{ lowStock() }} left in stock</span>
          } @else {
            <span class="text-xs text-green-700 flex items-center gap-1"><span class="w-2 h-2 bg-green-500 rounded-full"></span> In Stock</span>
          }
        </div>

        <p class="text-xs text-burgundy-500 mt-3 bg-cream-dark inline-block px-2 py-1 rounded">17 people are viewing this right now</p>

        <div class="grid grid-cols-1 xs:grid-cols-2 gap-3 mt-6 sticky bottom-[4.5rem] lg:static lg:bottom-auto bg-cream/95 lg:bg-transparent py-3 lg:py-0 -mx-4 px-4 sm:mx-0 sm:px-0 lg:mx-0 border-t border-burgundy-100 lg:border-0 z-30 lg:z-auto">
          <button type="button" class="btn-secondary flex items-center justify-center gap-2 w-full" (click)="addToCart(p)">🛒 Add to Cart</button>
          <button type="button" class="btn-primary w-full" (click)="buyNow(p)">Buy Now</button>
        </div>

        <div class="mt-8 space-y-3 text-sm">
          <div class="flex items-center gap-2 text-gray-600"><span>🔒</span> Secure Payment</div>
          <div class="flex items-center gap-2 text-gray-600"><span>🚚</span> Fast Delivery</div>
          <div class="flex items-center gap-2 text-gray-600"><span>✓</span> Quality Guaranteed</div>
        </div>

        <div class="flex gap-2 mt-6">
          <button type="button" class="btn-secondary text-sm" (click)="toggleWishlist(p)">♡ Save</button>
        </div>

        <div class="flex border-b border-burgundy-100 mt-8 text-xs sm:text-sm overflow-x-auto">
          <button type="button" class="px-3 sm:px-4 py-2 whitespace-nowrap shrink-0" [class.border-b-2]="tab()==='related'" [class.border-burgundy-800]="tab()==='related'" (click)="tab.set('related')">You May Like</button>
          <button type="button" class="px-3 sm:px-4 py-2 whitespace-nowrap shrink-0" [class.border-b-2]="tab()==='reviews'" [class.border-burgundy-800]="tab()==='reviews'" (click)="tab.set('reviews'); loadReviews(p.id)">Reviews</button>
          <button type="button" class="px-3 sm:px-4 py-2 whitespace-nowrap shrink-0" [class.border-b-2]="tab()==='write'" [class.border-burgundy-800]="tab()==='write'" (click)="tab.set('write')">Write Review</button>
        </div>
        @if (tab() === 'related' && related().length) {
          <div class="responsive-grid-products mt-4">
            @for (rp of related(); track rp.id) {
              <app-product-card [product]="rp" />
            }
          </div>
        }
        @if (tab() === 'reviews') {
          <div class="mt-4 space-y-3">
            @for (r of reviews(); track r.id) {
              <div class="section-card text-sm">
                <p class="font-semibold">{{ r.authorName }} · {{ '★'.repeat(r.rating) }}</p>
                @if (r.title) { <p class="font-medium">{{ r.title }}</p> }
                <p class="text-gray-600">{{ r.body }}</p>
              </div>
            }
            @if (reviews().length === 0) { <p class="text-gray-500 text-sm">No reviews yet.</p> }
          </div>
        }
        @if (tab() === 'write') {
          <form class="section-card mt-4 space-y-3" (ngSubmit)="submitReview(p.id)">
            <label class="text-sm">Rating</label>
            <select class="input-field" [(ngModel)]="reviewRating" name="rating">
              @for (n of [5,4,3,2,1]; track n) { <option [value]="n">{{ n }} stars</option> }
            </select>
            <input class="input-field" placeholder="Title" [(ngModel)]="reviewTitle" name="title" />
            <textarea class="input-field" rows="3" placeholder="Your review" [(ngModel)]="reviewBody" name="body"></textarea>
            <button type="submit" class="btn-primary">Submit review</button>
          </form>
        }
        </div>
        </div>
      </div>
    }
  `,
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cart = inject(CartService);
  private reviewService = inject(ReviewService);
  private wishlistService = inject(WishlistService);
  readonly auth = inject(AuthService);

  readonly product = signal<Product | null>(null);
  readonly related = signal<Product[]>([]);
  readonly reviews = signal<Review[]>([]);
  readonly tab = signal<'related' | 'reviews' | 'write'>('related');
  reviewRating = 5;
  reviewTitle = '';
  reviewBody = '';
  readonly imageIndex = signal(0);
  readonly selectedSize = signal<string | null>(null);
  readonly selectedColor = signal<ProductColor | null>(null);
  readonly qty = signal(1);

  constructor(private productService: ProductService) {
    this.route.paramMap
      .pipe(switchMap((params) => this.productService.getBySlug(params.get('slug')!)))
      .subscribe((p) => {
        this.product.set(p);
        this.selectedSize.set(p.sizes[0] ?? null);
        this.selectedColor.set(p.colors[0] ?? null);
        this.productService.getRelated(p.id).subscribe((list) => this.related.set(list));
      });
  }

  loadReviews(productId: string): void {
    this.reviewService.list(productId).subscribe((list) => this.reviews.set(list));
  }

  submitReview(productId: string): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.reviewService
      .create(productId, { rating: this.reviewRating, title: this.reviewTitle, body: this.reviewBody })
      .subscribe({
        next: () => {
          this.tab.set('reviews');
          this.loadReviews(productId);
          this.reviewTitle = '';
          this.reviewBody = '';
        },
      });
  }

  toggleWishlist(p: Product): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.wishlistService.add(p.id).subscribe(() => alert('Saved to wishlist'));
  }

  currentImage(): string {
    const p = this.product();
    if (!p?.images.length) return '';
    return p.images[this.imageIndex()]?.url ?? p.images[0].url;
  }

  prevImage(p: Product): void {
    this.imageIndex.update((i) => (i - 1 + p.images.length) % p.images.length);
  }

  nextImage(p: Product): void {
    this.imageIndex.update((i) => (i + 1) % p.images.length);
  }

  lowStock(): number | null {
    const p = this.product();
    const stock = p?.totalStock ?? 0;
    return stock > 0 && stock <= 5 ? stock : null;
  }

  addToCart(p: Product): void {
    const variant = p.variants?.find(
      (v) => v.size === this.selectedSize() && (!this.selectedColor() || v.colorName === this.selectedColor()?.name)
    ) ?? p.variants?.find((v) => v.size === this.selectedSize()) ?? p.variants?.[0];
    if (!variant?.id) {
      alert('This product has no stock variants. Ask admin to re-save it with sizes and stock.');
      return;
    }
    this.cart.addItem({
      variantId: variant.id,
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      imageUrl: p.images[0]?.url,
      size: this.selectedSize() ?? p.sizes[0],
      colorName: this.selectedColor()?.name,
      unitPrice: p.price,
      quantity: this.qty(),
      stockQuantity: variant?.stockQuantity ?? p.totalStock ?? 99,
    });
  }

  buyNow(p: Product): void {
    this.addToCart(p);
    this.router.navigate(['/checkout']);
  }

  decreaseQty(): void {
    this.qty.update((v) => Math.max(1, v - 1));
  }

  increaseQty(): void {
    this.qty.update((v) => v + 1);
  }
}
