import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SiteHeaderComponent } from '../../shared/components/site-header/site-header.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-cream-light">
      <app-site-header />
      <div class="bg-burgundy-800 text-white px-4 sm:px-6 py-5 sm:py-6">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:flex-wrap sm:items-end justify-between gap-4">
          <div>
            <p class="text-gold text-xs font-semibold tracking-widest uppercase mb-1">Admin</p>
            <h1 class="font-serif text-2xl sm:text-3xl font-bold">{{ pageTitle() }}</h1>
          </div>
          <nav class="flex gap-2 text-xs sm:text-sm flex-wrap overflow-x-auto pb-1 -mx-1 px-1 sm:overflow-visible">
            <a routerLink="/admin/dashboard" routerLinkActive="bg-gold text-burgundy-900" class="px-3 py-1.5 rounded-lg hover:bg-white/10">Dashboard</a>
            <a routerLink="/admin/products" routerLinkActive="bg-gold text-burgundy-900" class="px-3 py-1.5 rounded-lg hover:bg-white/10">Products</a>
            <a routerLink="/admin/orders" routerLinkActive="bg-gold text-burgundy-900" class="px-3 py-1.5 rounded-lg hover:bg-white/10">Orders</a>
            <a routerLink="/admin/coupons" routerLinkActive="bg-gold text-burgundy-900" class="px-3 py-1.5 rounded-lg hover:bg-white/10">Coupons</a>
            <a routerLink="/admin/categories" routerLinkActive="bg-gold text-burgundy-900" class="px-3 py-1.5 rounded-lg hover:bg-white/10">Categories</a>
            <a routerLink="/" class="px-3 py-1.5 rounded-lg hover:bg-white/10">← Store</a>
          </nav>
        </div>
      </div>
      <main class="flex-1 max-w-7xl mx-auto w-full min-w-0 px-4 sm:px-6 py-5 sm:py-6 lg:py-8">
        <router-outlet />
      </main>
      <app-site-footer />
    </div>
  `,
})
export class AdminLayoutComponent {
  pageTitle(): string {
    const path = window.location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('products/new')) return 'Create Product';
    if (path.includes('edit')) return 'Edit Product';
    if (path.includes('products')) return 'All Products';
    if (path.includes('orders')) return 'Orders';
    if (path.includes('coupons')) return 'Coupons';
    if (path.includes('categories')) return 'Categories';
    return 'Admin';
  }
}
