import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroCarouselComponent } from '../../shared/components/hero-carousel/hero-carousel.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, HeroCarouselComponent, ProductCardComponent, AsyncPipe],
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
            Discover mulmul sets, flowing skirts, and boutique pieces crafted for the modern woman.
          </p>
        </div>
      </div>

      <div class="mt-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-serif text-xl font-semibold text-burgundy-900">Trending Now</h2>
          <a routerLink="/shop" class="text-sm text-burgundy-600 font-medium hover:text-burgundy-800">View All →</a>
        </div>
        <div class="responsive-grid-products">
          @for (p of products$ | async; track p.id) {
            <app-product-card [product]="p" />
          }
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent {
  private readonly productService = inject(ProductService);
  readonly products$ = this.productService
    .getProducts({ size: 4 })
    .pipe(map((page) => page.content));
}
