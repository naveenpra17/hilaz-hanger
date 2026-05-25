import { Component, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductPage } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [FormsModule, ProductCardComponent, RouterLink],
  template: `
    <div class="page-container page-section">
      <h1 class="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-burgundy-900 mb-4 sm:mb-6">Shop Collection</h1>

      @if (categories().length) {
        <div class="flex flex-wrap gap-2 mb-4">
          <a
            routerLink="/shop"
            class="chip"
            [class.chip-active]="!activeCategory()"
            [class.chip-inactive]="activeCategory()"
          >All</a>
          @for (cat of categories(); track cat.id) {
            <a
              [routerLink]="['/shop']"
              [queryParams]="{ category: cat.slug }"
              class="chip"
              [class.chip-active]="activeCategory() === cat.slug"
              [class.chip-inactive]="activeCategory() !== cat.slug"
            >{{ cat.name }}</a>
          }
        </div>
      }

      <input
        type="search"
        class="input-field mb-4"
        placeholder="Search by name or brand..."
        [(ngModel)]="search"
        (ngModelChange)="load()"
      />

      <div class="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-1">
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

      @if (loading()) {
        <p class="text-center text-gray-500 py-12">Loading products...</p>
      } @else if (error()) {
        <div class="text-center py-12 px-4 bg-red-50 rounded-xl">
          <p class="text-red-700 text-sm">{{ error() }}</p>
          <button type="button" class="btn-primary mt-4" (click)="load()">Retry</button>
        </div>
      } @else if (page()) {
        @if (page()!.content.length === 0) {
          <p class="text-center text-gray-500 py-12">No products found.</p>
        } @else {
          <div class="responsive-grid-products">
            @for (product of page()!.content; track product.id) {
              <app-product-card [product]="product" />
            }
          </div>
        }
      }
    </div>
  `,
})
export class ShopComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  search = '';
  readonly activeFilter = signal('all');
  readonly activeCategory = signal<string | null>(null);
  readonly page = signal<ProductPage | null>(null);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly filters = [
    { id: 'all', label: 'All' },
    { id: 'low-stock', label: 'Low Stock' },
    { id: 'active', label: 'Active' },
  ];

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe((c) => this.categories.set(c));
    this.route.queryParamMap.subscribe((params) => {
      this.activeCategory.set(params.get('category'));
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.productService
      .getProducts({
        search: this.search,
        filter: this.activeFilter() === 'all' ? undefined : this.activeFilter(),
        category: this.activeCategory() ?? undefined,
        size: 20,
      })
      .subscribe({
        next: (p) => {
          this.page.set(p);
          this.loading.set(false);
        },
        error: () => {
          const status = err?.status;
          this.error.set(
            status === 0
              ? 'Could not reach API (network/CORS). Check Render CORS settings.'
              : `Could not load products (HTTP ${status ?? 'error'}). Redeploy latest API on Render and retry.`
          );
          this.loading.set(false);
        },
      });
  }

  setFilter(id: string): void {
    this.activeFilter.set(id);
    this.load();
  }
}
