import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 bg-cream/95 backdrop-blur-md border-t border-burgundy-100 z-50 lg:hidden safe-bottom shadow-[0_-4px_20px_rgba(74,14,14,0.06)]">
      <div class="flex justify-around items-stretch py-1.5 sm:py-2 max-w-lg mx-auto">
        @for (item of items(); track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="text-burgundy-800"
            [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
            class="flex flex-col items-center justify-center gap-0.5 text-burgundy-500 text-[10px] sm:text-xs px-2 py-2 min-w-[56px] min-h-[52px] flex-1 max-w-[80px]"
          >
            <span class="text-lg leading-none relative">
              @switch (item.icon) {
                @case ('home') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 10.5 12 3l9 7.5M6 9.5V21h12V9.5"/>
                  </svg>
                }
                @case ('shop') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 7h12l-1 13H7L6 7Zm2-2a4 4 0 1 1 8 0"/>
                  </svg>
                }
                @case ('saved') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 20s-6.5-4.35-8.5-7.2C1.7 10.2 2.1 6.9 4.7 5.3c2-1.2 4.3-.7 5.8.8.5.5 1 .5 1.5 0 1.5-1.5 3.8-2 5.8-.8 2.6 1.6 3 4.9 1.2 7.5C18.5 15.65 12 20 12 20Z"/>
                  </svg>
                }
                @case ('cart') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 4h2l1.2 11.2a2 2 0 0 0 2 1.8h7.8a2 2 0 0 0 2-1.6L19.5 7H7.2M9 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm9 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
                  </svg>
                  @if (cartCount() > 0) {
                    <span class="absolute -top-2 -right-3 bg-burgundy-500 text-white text-[9px] font-bold min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center">
                      {{ cartCount() }}
                    </span>
                  }
                }
                @default {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.5 0-6.5 2-7.5 5h15c-1-3-4-5-7.5-5Z"/>
                  </svg>
                }
              }
            </span>
            <span>{{ item.label }}</span>
          </a>
        }
      </div>
    </nav>
  `,
  styles: [`
    .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0); }
    a.router-link-active { color: #4a0e0e; font-weight: 600; }
  `],
})
export class BottomNavComponent {
  private auth = inject(AuthService);
  private cart = inject(CartService);
  readonly cartCount = this.cart.itemCount;

  readonly items = computed(() => {
    const profilePath = this.auth.isLoggedIn()
      ? this.auth.isAdmin()
        ? '/admin'
        : '/account'
      : '/login';
    const profileLabel = this.auth.isLoggedIn()
      ? this.auth.isAdmin()
        ? 'Admin'
        : 'Account'
      : 'Login';
    return [
      { path: '/', label: 'Home', icon: 'home', exact: true },
      { path: '/shop', label: 'Shop', icon: 'shop' },
      { path: '/saved', label: 'Saved', icon: 'saved' },
      { path: '/cart', label: 'Cart', icon: 'cart' },
      { path: profilePath, label: profileLabel, icon: 'profile' },
    ];
  });
}
