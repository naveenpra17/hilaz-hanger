import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto px-4 py-12">
      <h1 class="font-serif text-2xl font-bold text-center text-burgundy-900 mb-8">Set new password</h1>
      @if (!token) {
        <p class="text-red-600 text-sm text-center">Invalid reset link.</p>
      } @else {
        <form (ngSubmit)="submit()" class="space-y-4">
          <input type="password" class="input-field" placeholder="New password (min 6)" [(ngModel)]="password" name="pw" required />
          <input type="password" class="input-field" placeholder="Confirm password" [(ngModel)]="confirm" name="cf" required />
          @if (message()) {
            <p class="text-sm" [class.text-green-700]="success()" [class.text-red-600]="!success()">{{ message() }}</p>
          }
          <button type="submit" class="btn-primary w-full" [disabled]="loading()">Update password</button>
        </form>
      }
      <p class="text-center text-sm mt-6"><a routerLink="/login" class="text-burgundy-700 underline">Login</a></p>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = '';
  password = '';
  confirm = '';
  readonly loading = signal(false);
  readonly message = signal('');
  readonly success = signal(false);

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  submit(): void {
    if (this.password !== this.confirm) {
      this.message.set('Passwords do not match.');
      this.success.set(false);
      return;
    }
    this.loading.set(true);
    this.auth.resetPassword(this.token, this.password).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.success.set(true);
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.message.set(err?.error?.message ?? 'Reset failed. Link may have expired.');
        this.success.set(false);
        this.loading.set(false);
      },
    });
  }
}
