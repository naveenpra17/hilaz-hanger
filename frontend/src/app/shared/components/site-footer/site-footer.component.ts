import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../../core/services/store.service';
import { StoreConfigService } from '../../../core/services/store-config.service';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <footer class="bg-footer-gradient text-white mt-auto">
      <div class="max-w-7xl mx-auto px-4 py-10 text-center">
        <div class="w-14 h-14 rounded-full bg-white mx-auto flex items-center justify-center text-burgundy-800 font-serif font-bold text-xl mb-3">H</div>
        <p class="text-sm text-white/90 mb-4">Your one-stop destination for premium fashion.</p>
        <div class="flex justify-center gap-3 mb-8">
          <a [href]="store.instagramUrl()" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/10" aria-label="Instagram">IG</a>
          <a [href]="store.whatsappUrl()" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/10" aria-label="WhatsApp">WA</a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-sm mb-8">
          <div class="bg-white/5 rounded-xl p-4">
            <h4 class="font-semibold mb-2 text-gold-light">Support</h4>
            <ul class="space-y-1 text-white/80">
              <li><a routerLink="/page/faq" class="hover:text-white">FAQ</a></li>
              <li><a routerLink="/page/returns" class="hover:text-white">Return & Exchange</a></li>
              <li><a routerLink="/page/shipping" class="hover:text-white">Shipping</a></li>
              <li><a routerLink="/track-order" class="hover:text-white">Track order</a></li>
              <li><a routerLink="/contact" class="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div class="bg-white/5 rounded-xl p-4">
            <h4 class="font-semibold mb-2 text-gold-light">Legal</h4>
            <ul class="space-y-1 text-white/80">
              <li><a routerLink="/page/privacy" class="hover:text-white">Privacy Policy</a></li>
              <li><a routerLink="/page/terms" class="hover:text-white">Terms & Conditions</a></li>
              <li><a routerLink="/page/about" class="hover:text-white">About Us</a></li>
            </ul>
          </div>
          <div class="bg-white/5 rounded-xl p-4">
            <h4 class="font-semibold mb-2 text-gold-light">Contact</h4>
            <p class="text-white/80 text-xs leading-relaxed">📍 {{ store.config()?.address ?? 'Coimbatore, India' }}</p>
            <p class="text-white/80 text-xs">✉ {{ store.config()?.email }}</p>
            <p class="text-white/80 text-xs">📞 {{ store.config()?.phone }}</p>
          </div>
        </div>

        <form class="max-w-md mx-auto mb-8 flex gap-2" (ngSubmit)="subscribe()">
          <input type="email" class="input-field flex-1 text-burgundy-900 text-sm" placeholder="Email for offers" [(ngModel)]="newsletterEmail" name="nl" required />
          <button type="submit" class="btn-gold text-sm shrink-0 px-4">Subscribe</button>
        </form>
        @if (newsletterMsg()) {
          <p class="text-xs text-gold-light mb-4">{{ newsletterMsg() }}</p>
        }
        <p class="text-xs text-white/60">© Hilaz Hanger {{ year }} — All Rights Reserved</p>
      </div>
    </footer>
  `,
})
export class SiteFooterComponent {
  private storeApi = inject(StoreService);
  readonly store = inject(StoreConfigService);
  newsletterEmail = '';
  readonly newsletterMsg = signal('');
  readonly year = new Date().getFullYear();

  subscribe(): void {
    this.storeApi.subscribeNewsletter(this.newsletterEmail).subscribe({
      next: (r) => {
        this.newsletterMsg.set(r.message);
        this.newsletterEmail = '';
      },
      error: () => this.newsletterMsg.set('Subscription failed.'),
    });
  }
}
