import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page-container-narrow page-section pb-20">
      <h1 class="font-serif text-2xl font-bold text-burgundy-900 mb-6">My Account</h1>

      <section class="section-card mb-6 space-y-3">
        <h2 class="font-semibold text-burgundy-800">Profile</h2>
        <input class="input-field" placeholder="Full name" [(ngModel)]="fullName" name="name" />
        <input class="input-field" placeholder="Phone" [(ngModel)]="phone" name="phone" />
        <p class="text-xs text-gray-500">Email: {{ auth.user()?.email }}</p>
        <button type="button" class="btn-secondary" (click)="saveProfile()">Save profile</button>
      </section>

      <section class="section-card mb-6 space-y-3">
        <h2 class="font-semibold text-burgundy-800">Change password</h2>
        <input class="input-field" type="password" placeholder="Current password" [(ngModel)]="currentPassword" name="cur" />
        <input class="input-field" type="password" placeholder="New password (min 6)" [(ngModel)]="newPassword" name="new" />
        <button type="button" class="btn-secondary" (click)="changePassword()">Update password</button>
      </section>

      <div class="flex flex-wrap gap-3 text-sm">
        <a routerLink="/orders" class="text-burgundy-700 underline">My orders</a>
        <a routerLink="/saved" class="text-burgundy-700 underline">Saved items</a>
        <button type="button" class="text-red-700 underline" (click)="logout()">Log out</button>
      </div>

      @if (message()) {
        <p class="text-sm mt-4" [class.text-green-700]="success()" [class.text-red-600]="!success()">{{ message() }}</p>
      }
    </div>
  `,
})
export class AccountComponent implements OnInit {
  readonly auth = inject(AuthService);
  private userService = inject(UserService);

  fullName = '';
  phone = '';
  currentPassword = '';
  newPassword = '';
  readonly message = signal('');
  readonly success = signal(false);

  ngOnInit(): void {
    const u = this.auth.user();
    if (u) {
      this.fullName = u.fullName;
      this.phone = u.phone ?? '';
    }
    this.userService.getProfile().subscribe((p) => {
      this.fullName = p.fullName;
      this.phone = p.phone ?? '';
    });
  }

  saveProfile(): void {
    this.userService.updateProfile({ fullName: this.fullName, phone: this.phone }).subscribe({
      next: () => {
        this.message.set('Profile updated.');
        this.success.set(true);
      },
      error: () => this.message.set('Update failed.'),
    });
  }

  changePassword(): void {
    this.userService.changePassword({ currentPassword: this.currentPassword, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.message.set('Password changed.');
        this.success.set(true);
        this.currentPassword = '';
        this.newPassword = '';
      },
      error: () => this.message.set('Password change failed. Check current password.'),
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
