import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/services/store.service';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page-container-narrow page-section pb-20">
      <a routerLink="/" class="text-sm text-burgundy-600 mb-4 inline-block">← Home</a>
      <h1 class="font-serif text-2xl font-bold text-burgundy-900 mb-2">Contact Us</h1>
      <p class="text-gray-600 text-sm mb-6">📍 Coimbatore, India · ✉ hello&#64;hilazhanger.com · 📞 +91 98765 43210</p>
      <form class="section-card space-y-4" (ngSubmit)="submit()">
        <input class="input-field" placeholder="Your name" [(ngModel)]="name" name="name" required />
        <input class="input-field" type="email" placeholder="Email" [(ngModel)]="email" name="email" required />
        <textarea class="input-field" rows="4" placeholder="Message" [(ngModel)]="message" name="msg" required></textarea>
        @if (feedback()) {
          <p class="text-sm" [class.text-green-700]="ok()" [class.text-red-600]="!ok()">{{ feedback() }}</p>
        }
        <button type="submit" class="btn-primary w-full" [disabled]="loading()">Send message</button>
      </form>
    </div>
  `,
})
export class ContactPageComponent {
  private store = inject(StoreService);
  name = '';
  email = '';
  message = '';
  readonly loading = signal(false);
  readonly feedback = signal('');
  readonly ok = signal(false);

  submit(): void {
    this.loading.set(true);
    this.store.contact({ name: this.name, email: this.email, message: this.message }).subscribe({
      next: (r) => {
        this.feedback.set(r.message);
        this.ok.set(true);
        this.loading.set(false);
        this.message = '';
      },
      error: () => {
        this.feedback.set('Could not send message. Try again later.');
        this.ok.set(false);
        this.loading.set(false);
      },
    });
  }
}
