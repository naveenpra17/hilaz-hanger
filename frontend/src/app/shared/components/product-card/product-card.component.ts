import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { onImageError, PLACEHOLDER_PRODUCT } from '../../../core/constants/media-urls';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/product', product().id]" class="block bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-lg transition-shadow group">
      <div class="aspect-[3/4] relative overflow-hidden">
        <img
          [src]="primaryImage()"
          [alt]="product().name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          (error)="onImageError($event)"
        />
        @for (label of product().labels.slice(0, 1); track label) {
          <span class="absolute top-2 left-2 bg-burgundy-800 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">{{ label }}</span>
        }
        @if ((product().totalStock ?? 0) <= 5 && (product().totalStock ?? 0) > 0) {
          <span class="absolute bottom-2 right-2 bg-orange-100 text-orange-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">Only {{ product().totalStock }} left</span>
        }
      </div>
      <div class="p-3">
        <h3 class="font-serif font-semibold text-burgundy-900 text-sm line-clamp-2">{{ product().name }}</h3>
        <div class="flex items-baseline gap-2 mt-1">
          <span class="font-bold text-burgundy-800">₹{{ product().price }}</span>
          @if (product().compareAtPrice) {
            <span class="text-xs text-gray-400 line-through">₹{{ product().compareAtPrice }}</span>
          }
        </div>
      </div>
    </a>
  `,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly onImageError = onImageError;

  primaryImage(): string {
    const p = this.product();
    const url = p.images?.find((i) => i.isPrimary)?.url ?? p.images?.[0]?.url ?? '';
    return url || PLACEHOLDER_PRODUCT;
  }
}
