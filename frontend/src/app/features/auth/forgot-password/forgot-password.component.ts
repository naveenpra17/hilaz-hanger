import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-md mx-auto px-4 py-12">
      <h1 class="font-serif text-2xl font-bold text-center text-burgundy-900 mb-2">Forgot password</h1>
      <p class="text-sm text-gray-600 text-center mb-8">We will email you a reset link if the address is registered.</p>
      <form (ngSubmit)="submit()" class="space-y-4">
        <input type="email" class="input-field" placeholder="Email" [(ngModel)]="email" name="email" required />
        @if (message()) {
          <p class="text-sm" [class.text-green-700]="success()" [class.text-red-600]="!success()">{{ message() }}</p>
        }
        <button type="submit" class="btn-primary w-full flex items-center justify-center gap-2" [disabled]="loading()">
          @if (loading()) {
            <app-loading-spinner size="sm" [inline]="true" />
            <span>Sending...</span>
          } @else {
            <span>Send reset link</span>
          }
        </button>
      </form>
      <p class="text-center text-sm mt-6"><a routerLink="/login" class="text-burgundy-700 underline">Back to login</a></p>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);
  email = '';
  readonly loading = signal(false);
  readonly message = signal('');
  readonly success = signal(false);

  submit(): void {
    this.loading.set(true);
    this.message.set('');
    this.auth.forgotPassword(this.email.trim()).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.success.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.message.set('Something went wrong. Try again later.');
        this.success.set(false);
        this.loading.set(false);
      },
    });
  }
}
