import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { ProductPage } from '../../core/models/product.model';
import { switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [FormsModule, ProductCardComponent],
  template: `
    <div class="page-container page-section">
      <h1 class="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-burgundy-900 mb-4 sm:mb-6">Shop Collection</h1>

      <input
        type="search"
        class="input-field mb-4"
        placeholder="Search by name or brand..."
        [(ngModel)]="search"
        (ngModelChange)="onSearchChange()"
      />

      <div class="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1 sm:overflow-visible">
        @for (f of filters; track f.id) {
          <button
            type="button"
            class="chip"
            [class.chip-active]="activeFilter() === f.id"
            [class.chip-inactive]="activeFilter() !== f.id"
            (click)="setFilter(f.id)"
          >{{ f.label }}</button>
        }
      </div>

      @if (page(); as p) {
        <div class="responsive-grid-products">
          @for (product of p.content; track product.id) {
            <app-product-card [product]="product" />
          }
        </div>
        @if (p.content.length === 0) {
          <p class="text-center text-gray-500 py-12">No products found.</p>
        }
      }
    </div>
  `,
})
export class ShopComponent {
  search = '';
  readonly activeFilter = signal('all');
  readonly page = signal<ProductPage | null>(null);
  private readonly search$ = new Subject<void>();

  readonly filters = [
    { id: 'all', label: 'All' },
    { id: 'low-stock', label: 'Low Stock' },
    { id: 'active', label: 'Active' },
  ];

  constructor(private productService: ProductService) {
    this.search$.pipe(
      switchMap(() =>
        this.productService.getProducts({
          search: this.search,
          filter: this.activeFilter() === 'all' ? undefined : this.activeFilter(),
          size: 20,
        })
      )
    ).subscribe((p) => this.page.set(p));
    this.search$.next();
  }

  onSearchChange(): void {
    this.search$.next();
  }

  setFilter(id: string): void {
    this.activeFilter.set(id);
    this.search$.next();
  }
}
