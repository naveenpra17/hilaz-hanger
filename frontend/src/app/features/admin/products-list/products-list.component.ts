import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminProductRowComponent } from '../../../shared/components/admin-product-row/admin-product-row.component';
import { ProductService } from '../../../core/services/product.service';
import { ProductPage } from '../../../core/models/product.model';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [RouterLink, FormsModule, AdminProductRowComponent],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6 -mt-2">
      <p class="text-sm text-gray-600">{{ page()?.totalElements ?? 0 }} products shown</p>
      <a routerLink="/admin/products/new" class="btn-gold text-sm">+ Create Product</a>
    </div>

    <input
      type="search"
      class="input-field mb-4"
      placeholder="Search by name or brand..."
      [(ngModel)]="search"
      (ngModelChange)="load()"
    />

    <div class="flex flex-wrap gap-2 mb-6">
      @for (f of filters; track f.id) {
        <button
          type="button"
          class="chip text-xs"
          [class.chip-active]="filter() === f.id"
          [class.chip-inactive]="filter() !== f.id"
          (click)="filter.set(f.id); load()"
        >{{ f.label }}</button>
      }
    </div>

    <div class="space-y-4">
      @for (p of page()?.content ?? []; track p.id) {
        <app-admin-product-row [product]="p" (deleteClick)="onDelete($event)" />
      }
    </div>

    @if (page(); as pg) {
      <div class="flex items-center justify-center gap-2 mt-8 flex-wrap">
        <button type="button" class="w-8 h-8 rounded border" (click)="goPage(pg.number - 1)" [disabled]="pg.number === 0">‹</button>
        @for (n of pageNumbers(pg); track n) {
          <button
            type="button"
            class="w-8 h-8 rounded text-sm"
            [class.bg-burgundy-400]="n === pg.number + 1"
            [class.text-white]="n === pg.number + 1"
            [class.border]="n !== pg.number + 1"
            (click)="goPage(n - 1)"
          >{{ n }}</button>
        }
        <button type="button" class="w-8 h-8 rounded border" (click)="goPage(pg.number + 1)" [disabled]="pg.number >= pg.totalPages - 1">›</button>
        <span class="text-xs text-gray-500 ml-2">Page {{ pg.number + 1 }} of {{ pg.totalPages }}</span>
      </div>
    }
  `,
})
export class ProductsListComponent {
  search = '';
  readonly filter = signal('all');
  readonly page = signal<ProductPage | null>(null);
  private currentPage = 0;

  readonly filters = [
    { id: 'all', label: 'All' },
    { id: 'out-of-stock', label: 'Out of Stock' },
    { id: 'low-stock', label: 'Low Stock' },
    { id: 'inactive', label: 'Inactive' },
    { id: 'active', label: 'Active' },
  ];

  constructor(private productService: ProductService) {
    this.load();
  }

  load(): void {
    this.productService
      .getProducts({
        page: this.currentPage,
        size: 5,
        search: this.search,
        filter: this.filter() === 'all' ? undefined : this.filter(),
      })
      .subscribe((p) => this.page.set(p));
  }

  goPage(n: number): void {
    const pg = this.page();
    if (!pg || n < 0 || n >= pg.totalPages) return;
    this.currentPage = n;
    this.load();
  }

  pageNumbers(pg: ProductPage): number[] {
    const total = Math.min(pg.totalPages, 10);
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  onDelete(id: string): void {
    if (!confirm('Delete this product permanently?')) return;
    this.productService.delete(id).subscribe({
      next: () => this.load(),
      error: () => alert('Delete failed. Log in as admin and ensure API is deployed.'),
    });
  }
}
