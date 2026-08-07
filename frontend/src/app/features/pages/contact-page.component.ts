import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/services/store.service';
import { StoreConfigService } from '../../core/services/store-config.service';
import { BRAND } from '../../core/content/brand-content';
import { SeoService } from '../../core/services/seo.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [FormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="page-container-narrow page-section pb-20">
      <a routerLink="/" class="text-sm text-burgundy-600 mb-4 inline-block">← Home</a>
      <h1 class="font-serif text-2xl font-bold text-burgundy-900 mb-2">Contact Us</h1>
      <p class="text-gray-600 text-sm mb-2 whitespace-pre-line">📍 {{ address() }}</p>
      <p class="text-gray-600 text-sm mb-1">✉ {{ contactEmail() }}</p>
      <p class="text-gray-600 text-sm mb-6">📞 {{ contactPhone() }}</p>
      <div class="flex gap-3 mb-6">
        <a [href]="store.whatsappUrl()" target="_blank" rel="noopener" class="btn-secondary text-sm">WhatsApp</a>
        <a [href]="store.instagramUrl()" target="_blank" rel="noopener" class="btn-secondary text-sm">Instagram</a>
      </div>
      <form class="section-card space-y-4" (ngSubmit)="submit()">
        <input type="text" name="website" class="hidden" tabindex="-1" autocomplete="off" [(ngModel)]="honeypot" />
        <input class="input-field" placeholder="Your name" [(ngModel)]="name" name="name" required />
        <input class="input-field" type="email" placeholder="Email" [(ngModel)]="email" name="email" required />
        <textarea class="input-field" rows="4" placeholder="Message" [(ngModel)]="message" name="msg" required></textarea>
        @if (feedback()) {
          <p class="text-sm" [class.text-green-700]="ok()" [class.text-red-600]="!ok()">{{ feedback() }}</p>
        }
        <button type="submit" class="btn-primary w-full flex items-center justify-center gap-2" [disabled]="loading()">
          @if (loading()) {
            <app-loading-spinner size="sm" [inline]="true" />
            <span>Sending...</span>
          } @else {
            <span>Send message</span>
          }
        </button>
      </form>
    </div>
  `,
})
export class ContactPageComponent implements OnInit {
  private storeApi = inject(StoreService);
  readonly store = inject(StoreConfigService);
  private seo = inject(SeoService);

  name = '';
  email = '';
  message = '';
  honeypot = '';
  readonly loading = signal(false);
  readonly feedback = signal('');
  readonly ok = signal(false);

  address = () => this.store.config()?.address ?? BRAND.addressLine;
  contactPhone = () => this.store.config()?.phone ?? BRAND.phone;
  contactEmail = () => this.store.config()?.email ?? BRAND.email;

  ngOnInit(): void {
    this.seo.setPage(
      'Contact — HILAZ HANGER',
      `Contact HILAZ HANGER in Coimbatore. Phone ${BRAND.phone}.`,
      undefined,
      '/contact'
    );
  }

  submit(): void {
    if (this.honeypot) return;
    this.loading.set(true);
    this.storeApi
      .contact({ name: this.name, email: this.email, message: this.message, website: this.honeypot })
      .subscribe({
        next: (r) => {
          this.feedback.set(r.message);
          this.ok.set(true);
          this.loading.set(false);
          this.message = '';
        },
        error: () => {
          this.feedback.set('Could not send message. Try WhatsApp or email us directly.');
          this.ok.set(false);
          this.loading.set(false);
        },
      });
  }
}
