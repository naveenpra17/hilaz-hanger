import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-md mx-auto px-4 py-12">
      <h1 class="font-serif text-2xl font-bold text-center text-burgundy-900 mb-8">Create Account</h1>
      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <input class="input-field" placeholder="Full name" [(ngModel)]="fullName" name="fullName" required />
        <input type="email" class="input-field" placeholder="Email" [(ngModel)]="email" name="email" required />
        <input class="input-field" placeholder="Phone" [(ngModel)]="phone" name="phone" />
        <input type="password" class="input-field" placeholder="Password" [(ngModel)]="password" name="password" required />
        @if (error()) { <p class="text-red-600 text-sm">{{ error() }}</p> }
        <button type="submit" class="btn-primary w-full flex items-center justify-center gap-2" [disabled]="loading()">
          @if (loading()) {
            <app-loading-spinner size="sm" [inline]="true" />
            <span>Creating account...</span>
          } @else {
            <span>Register</span>
          }
        </button>
      </form>
      <p class="text-center text-sm mt-6"><a routerLink="/login" class="text-burgundy-700">Already have an account?</a></p>
    </div>
  `,
})
export class RegisterComponent {
  fullName = '';
  email = '';
  phone = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal('');

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading.set(true);
    this.error.set('');
    this.auth.register({ fullName: this.fullName, email: this.email, phone: this.phone, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: () => {
        this.error.set('Registration failed. Start the backend API.');
        this.loading.set(false);
      },
    });
  }
}
