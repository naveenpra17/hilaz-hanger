import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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
            <span class="text-lg">{{ item.icon }}</span>
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
      { path: '/', label: 'Home', icon: '🏠', exact: true },
      { path: '/shop', label: 'Shop', icon: '🛍️' },
      { path: '/saved', label: 'Saved', icon: '♡' },
      { path: '/cart', label: 'Cart', icon: '🛒' },
      { path: profilePath, label: profileLabel, icon: '👤' },
    ];
  });
}
