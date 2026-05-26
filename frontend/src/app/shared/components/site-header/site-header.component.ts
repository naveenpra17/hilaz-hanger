import { Component, inject, input, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="bg-header-gradient text-white sticky top-0 z-40 shadow-md">
      <div class="page-container py-2.5 sm:py-3">
        <div class="flex items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            class="lg:hidden p-2 -ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open menu"
            (click)="menuOpen.set(!menuOpen())"
          >
            @if (menuOpen()) {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            } @else {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            }
          </button>

          <a routerLink="/" class="flex items-center gap-2 shrink-0 min-w-0" (click)="menuOpen.set(false)">
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center text-burgundy-700 font-serif font-bold text-xs sm:text-sm shrink-0">H</div>
            <span class="font-serif text-base sm:text-lg font-semibold truncate max-w-[120px] xs:max-w-none sm:max-w-none">Hilaz Hanger</span>
          </a>

          @if (!compact()) {
            <nav class="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium shrink-0">
              <a routerLink="/" routerLinkActive="text-gold" [routerLinkActiveOptions]="{exact: true}" class="hover:text-gold transition-colors whitespace-nowrap">Home</a>
              <a routerLink="/shop" routerLinkActive="text-gold" class="hover:text-gold transition-colors whitespace-nowrap">Shop</a>
              <div class="relative group">
                <button type="button" class="hover:text-gold flex items-center gap-1 whitespace-nowrap py-2">
                  Categories ▾
                </button>
                <div class="absolute top-full left-0 mt-1 w-48 bg-white text-burgundy-900 rounded-xl shadow-lg border border-burgundy-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-2">
                  @for (cat of categories(); track cat.id) {
                    <a
                      [routerLink]="['/shop']"
                      [queryParams]="{ category: cat.slug }"
                      class="block px-4 py-2.5 text-sm hover:bg-cream"
                    >{{ cat.name }}</a>
                  }
                  @if (categories().length === 0) {
                    <span class="block px-4 py-2 text-xs text-gray-500">Loading...</span>
                  }
                </div>
              </div>
            </nav>

            <div class="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-2 lg:mx-4 min-w-0">
              <div class="relative w-full">
                <input
                  type="search"
                  placeholder="Search products..."
                  class="w-full py-2 pl-4 pr-10 rounded-full bg-burgundy-700/80 border border-burgundy-600 text-white placeholder:text-burgundy-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                  [(ngModel)]="searchQuery"
                  (keydown.enter)="goSearch()"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gold pointer-events-none">🔍</span>
              </div>
            </div>
          }

          <div class="flex items-center gap-0.5 sm:gap-2 shrink-0">
            <a routerLink="/saved" class="p-2 hover:text-gold hidden sm:flex min-w-[40px] min-h-[40px] items-center justify-center" aria-label="Wishlist">♡</a>
            <a routerLink="/cart" class="p-2 hover:text-gold relative min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Cart" (click)="menuOpen.set(false)">
              🛒
              @if (cartCount() > 0) {
                <span class="absolute top-1 right-0.5 bg-gold text-burgundy-900 text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">{{ cartCount() }}</span>
              }
            </a>
            @if (auth.isLoggedIn()) {
              @if (!auth.isAdmin()) {
                <a routerLink="/orders" class="hidden sm:inline text-xs hover:text-gold whitespace-nowrap">My Orders</a>
              }
              <a [routerLink]="auth.isAdmin() ? '/admin' : '/orders'" class="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-gold text-burgundy-900 flex items-center justify-center text-sm font-bold shrink-0" [attr.aria-label]="auth.isAdmin() ? 'Admin' : 'My orders'">
                {{ auth.user()?.fullName?.charAt(0) ?? 'H' }}
              </a>
            } @else {
              <a routerLink="/login" class="text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-full border border-white/40 hover:bg-white/10 hidden xs:inline sm:inline whitespace-nowrap">Login</a>
            }
          </div>
        </div>

        @if (compact() || menuOpen()) {
          @if (compact()) {
            <div class="mt-2 sm:mt-3 relative lg:hidden">
              <input
                type="search"
                placeholder="Search products..."
                class="w-full py-2.5 pl-4 pr-12 rounded-full bg-cream text-burgundy-900 placeholder:text-gray-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                [(ngModel)]="searchQuery"
                (keydown.enter)="goSearch()"
              />
              <span class="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gold flex items-center justify-center text-white text-sm pointer-events-none">🔍</span>
            </div>
          }

          @if (menuOpen()) {
            <nav class="lg:hidden mt-3 pt-3 border-t border-white/20 flex flex-col gap-1 pb-1">
              <a routerLink="/" routerLinkActive="bg-white/10" [routerLinkActiveOptions]="{exact: true}" class="px-3 py-3 rounded-lg text-sm font-medium min-h-[44px] flex items-center" (click)="menuOpen.set(false)">Home</a>
              <a routerLink="/shop" routerLinkActive="bg-white/10" class="px-3 py-3 rounded-lg text-sm font-medium min-h-[44px] flex items-center" (click)="menuOpen.set(false)">Shop</a>
              <p class="px-3 pt-2 text-xs text-white/60 uppercase tracking-wider">Categories</p>
              @for (cat of categories(); track cat.id) {
                <a
                  [routerLink]="['/shop']"
                  [queryParams]="{ category: cat.slug }"
                  class="px-3 py-2 rounded-lg text-sm text-white/90 hover:bg-white/10"
                  (click)="menuOpen.set(false)"
                >{{ cat.name }}</a>
              }
              <a routerLink="/saved" class="px-3 py-3 rounded-lg text-sm font-medium min-h-[44px] flex items-center sm:hidden" (click)="menuOpen.set(false)">Saved</a>
              @if (auth.isLoggedIn() && !auth.isAdmin()) {
                <a routerLink="/orders" class="px-3 py-3 rounded-lg text-sm font-medium min-h-[44px] flex items-center" (click)="menuOpen.set(false)">My Orders</a>
              }
              <a routerLink="/login" class="px-3 py-3 rounded-lg text-sm font-medium min-h-[44px] flex items-center sm:hidden" (click)="menuOpen.set(false)">Profile / Login</a>
              @if (auth.isAdmin()) {
                <a routerLink="/admin" class="px-3 py-3 rounded-lg text-sm font-medium min-h-[44px] flex items-center text-gold" (click)="menuOpen.set(false)">Admin Panel</a>
              }
            </nav>
          }
        }
      </div>
    </header>
  `,
})
export class SiteHeaderComponent implements OnInit {
  readonly compact = input(false);
  readonly menuOpen = signal(false);
  searchQuery = '';
  private router = inject(Router);
  readonly categories = signal<Category[]>([]);
  readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly categoryService = inject(CategoryService);
  readonly cartCount = this.cart.itemCount;

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe((c) => this.categories.set(c));
  }

  goSearch(): void {
    const q = this.searchQuery.trim();
    this.router.navigate(['/shop'], { queryParams: q ? { search: q } : {} });
    this.menuOpen.set(false);
  }
}
