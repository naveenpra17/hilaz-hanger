import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-promo-bar',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="bg-burgundy-900 text-white text-xs sm:text-sm py-2 px-4 flex items-center justify-center gap-2 relative">
        <span>🎁</span>
        <span class="text-center">FREE shipping on orders ₹999+ · Use code WELCOME10 at checkout</span>
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center"
          (click)="visible.set(false)"
          aria-label="Close"
        >×</button>
      </div>
    }
  `,
})
export class PromoBarComponent {
  readonly visible = signal(true);
}
