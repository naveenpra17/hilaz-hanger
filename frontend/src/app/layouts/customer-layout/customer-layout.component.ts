import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { PromoBarComponent } from '../../shared/components/promo-bar/promo-bar.component';
import { SiteHeaderComponent } from '../../shared/components/site-header/site-header.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { WhatsappChatComponent } from '../../shared/components/whatsapp-chat/whatsapp-chat.component';
import { RouteLoadingBarComponent } from '../../shared/components/route-loading-bar/route-loading-bar.component';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, PromoBarComponent, SiteHeaderComponent, SiteFooterComponent, BottomNavComponent, WhatsappChatComponent, RouteLoadingBarComponent],
  template: `
    <app-route-loading-bar />
    <div class="min-h-screen flex flex-col bg-cream">
      <app-promo-bar />
      <app-site-header [compact]="isHome()" />
      <main class="flex-1 main-with-bottom-nav w-full min-w-0">
        <router-outlet />
      </main>
      <app-site-footer />
      <app-whatsapp-chat />
      <app-bottom-nav />
    </div>
  `,
})
export class CustomerLayoutComponent {
  private router = inject(Router);
  readonly isHome = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url === '/' || this.router.url === ''),
      startWith(this.router.url === '/' || this.router.url === '')
    ),
    { initialValue: true }
  );
}
