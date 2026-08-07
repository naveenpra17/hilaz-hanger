import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-route-loading-bar',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="fixed top-0 left-0 right-0 z-[9999] h-1 bg-burgundy-100 overflow-hidden pointer-events-none" aria-hidden="true">
        <div class="route-loading-bar-fill h-full w-1/3 bg-gradient-to-r from-burgundy-600 to-gold"></div>
      </div>
    }
  `,
  styles: [
    `
      .route-loading-bar-fill {
        animation: route-loading-slide 0.9s ease-in-out infinite;
      }

      @keyframes route-loading-slide {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(350%);
        }
      }
    `,
  ],
})
export class RouteLoadingBarComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private sub?: Subscription;
  private hideTimer?: ReturnType<typeof setTimeout>;

  readonly visible = signal(false);

  ngOnInit(): void {
    this.sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (this.hideTimer) clearTimeout(this.hideTimer);
        this.visible.set(true);
        return;
      }

      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.hideTimer = setTimeout(() => this.visible.set(false), 250);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }
}
