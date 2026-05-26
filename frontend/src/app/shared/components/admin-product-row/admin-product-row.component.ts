import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-product-row',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="section-card flex flex-col xs:flex-row gap-3 sm:gap-4">
      <img [src]="image()" [alt]="product().name" class="w-full xs:w-24 sm:w-28 h-40 xs:h-28 sm:h-32 object-cover rounded-xl shrink-0" />
      <div class="flex-1 min-w-0 flex flex-col">
        <div class="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-2 items-start">
          <div class="min-w-0 flex-1">
            <h3 class="font-bold text-burgundy-900 text-sm sm:text-base leading-tight break-words">{{ product().name }}</h3>
            @if (product().createdAt) {
              <p class="text-xs text-gray-500 mt-0.5">{{ formatDate(product().createdAt!) }}</p>
            }
          </div>
          <span class="font-bold text-burgundy-900 shrink-0 text-base sm:text-lg">₹{{ product().price }}</span>
        </div>
        @if (product().fabric) {
          <p class="text-xs text-gray-500 mt-2 line-clamp-2">Fabric: {{ product().fabric }} @if (product().colorInfo) { · Color: {{ product().colorInfo }} }</p>
        }
        <div class="flex flex-wrap items-center gap-2 mt-auto pt-3">
          <a [routerLink]="['/admin/products', product().id, 'edit']" class="bg-burgundy-400 hover:bg-burgundy-500 text-white text-xs font-medium px-3 py-2 rounded-lg inline-flex items-center gap-1">
            Edit →
          </a>
          <button
            type="button"
            class="text-xs text-red-700 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50"
            (click)="deleteClick.emit(product().id)"
          >
            Delete
          </button>
          @if (stockBadge(); as badge) {
            <span [class]="badge.class">{{ badge.text }}</span>
          }
        </div>
      </div>
    </article>
  `,
})
export class AdminProductRowComponent {
  readonly product = input.required<Product>();
  readonly deleteClick = output<string>();

  image(): string {
    const p = this.product();
    return p.images?.[0]?.url ?? '';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  stockBadge(): { text: string; class: string } | null {
    const stock = this.product().totalStock ?? 0;
    if (stock === 0) return { text: 'Out of Stock', class: 'text-xs px-2 py-1 rounded-full bg-red-100 text-red-700' };
    if (stock <= 5) return { text: `Low Stock: ${stock}`, class: 'text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800' };
    return { text: `In Stock: ${stock}`, class: 'text-xs px-2 py-1 rounded-full bg-green-100 text-green-800' };
  }
}
