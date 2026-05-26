import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto px-4 py-12">
      <h1 class="font-serif text-2xl font-bold text-center text-burgundy-900 mb-8">Welcome Back</h1>

      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="text-sm font-medium">Email</label>
          <input type="email" class="input-field mt-1" [(ngModel)]="email" name="email" required />
        </div>
        <div>
          <div class="flex justify-between items-center">
            <label class="text-sm font-medium">Password</label>
            <a routerLink="/forgot-password" class="text-xs text-burgundy-600 underline">Forgot password?</a>
          </div>
          <input type="password" class="input-field mt-1" [(ngModel)]="password" name="password" required />
        </div>
        @if (error()) {
          <p class="text-red-600 text-sm">{{ error() }}</p>
        }
        <button type="submit" class="btn-primary w-full" [disabled]="loading()">Login</button>
      </form>

      <p class="text-center text-sm mt-6 text-gray-600">
        No account? <a routerLink="/register" class="text-burgundy-700 font-medium">Register</a>
      </p>

    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal('');

  onSubmit(): void {
    this.loading.set(true);
    this.error.set('');
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        const admin = this.route.snapshot.queryParams['admin'] || this.auth.isAdmin();
        this.router.navigate(admin ? ['/admin/dashboard'] : ['/']);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Login failed. Check email/password and that the API is running.');
        this.loading.set(false);
      },
    });
  }

}
