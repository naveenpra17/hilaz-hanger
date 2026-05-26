import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroCarouselComponent } from '../../shared/components/hero-carousel/hero-carousel.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { StoreConfigService } from '../../core/services/store-config.service';
import { Product } from '../../core/models/product.model';
import { BRAND } from '../../core/content/brand-content';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, HeroCarouselComponent, ProductCardComponent],
  template: `
    <app-hero-carousel />

    <section class="page-container page-section">
      <div class="flex justify-center mb-4">
        <span class="chip chip-inactive border-burgundy-300 text-xs tracking-widest uppercase">
          ✨ Premium Fashion Collection
        </span>
      </div>

      <h1 class="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl text-center text-burgundy-900 font-bold leading-tight px-2">
        Elevate Your <span class="style-underline">Style</span> Journey
      </h1>

      <div class="mt-6 flex gap-4 max-w-2xl mx-auto">
        <div class="w-1 bg-burgundy-400 rounded-full shrink-0"></div>
        <div>
          <p class="font-serif italic text-burgundy-600 text-lg">Where fantasy unfolds</p>
          <p class="text-sm text-gray-600 mt-2 leading-relaxed">
            Curated collections blending timeless elegance with contemporary comfort.
          </p>
        </div>
      </div>

      <section class="mt-10 section-card text-center">
        <h2 class="font-serif text-lg font-semibold text-burgundy-900 mb-2">Follow {{ BRAND.name }}</h2>
        <p class="text-sm text-gray-600 mb-4">New drops &amp; styling on Instagram {{ BRAND.instagramHandle }}</p>
        <a
          [href]="store.instagramUrl()"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-secondary inline-block text-sm"
        >View on Instagram</a>
      </section>

      <div class="mt-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-serif text-xl font-semibold text-burgundy-900">Trending Now</h2>
          <a routerLink="/shop" class="text-sm text-burgundy-600 font-medium hover:text-burgundy-800">View All →</a>
        </div>

        @if (loading()) {
          <p class="text-center text-gray-500 py-8">Loading products...</p>
        } @else if (error()) {
          <div class="text-center py-8 px-4 bg-red-50 rounded-xl border border-red-100">
            <p class="text-red-700 text-sm">{{ error() }}</p>
            <button type="button" class="btn-primary mt-4 text-sm" (click)="load()">Retry</button>
          </div>
        } @else if (products().length === 0) {
          <p class="text-center text-gray-500 py-8">No products yet. Check API is deployed.</p>
        } @else {
          <div class="responsive-grid-products">
            @for (p of products(); track p.id) {
              <app-product-card [product]="p" />
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  readonly BRAND = BRAND;
  readonly store = inject(StoreConfigService);
  private readonly productService = inject(ProductService);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.productService.getProducts({ size: 4 }).subscribe({
      next: (page) => {
        this.products.set(page.content);
        this.loading.set(false);
      },
      error: (err) => {
        const status = err?.status;
        const hint =
          status === 0
            ? 'Network or CORS blocked the API. Check APP_CORS_ALLOWED_ORIGINS on Render includes this site URL.'
            : status === 500
              ? 'API returned an error. Redeploy the latest backend on Render, wait for Live, then retry.'
              : `API request failed (${status ?? 'unknown'}).`;
        this.error.set(`Could not load products. ${hint}`);
        this.loading.set(false);
      },
    });
  }
}
