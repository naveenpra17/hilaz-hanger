import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { AddressService } from '../../core/services/address.service';
import { SavedAddress } from '../../core/models/address.model';

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
        <h2 class="font-semibold text-burgundy-800">Saved addresses</h2>
        @for (a of addresses(); track a.id) {
          <div class="border border-pink-100 rounded-xl p-3 text-sm">
            <p class="font-medium">{{ a.label }} @if (a.defaultAddress) { <span class="text-xs text-gold">Default</span> }</p>
            <p>{{ a.fullName }} · {{ a.phone }}</p>
            <p class="text-gray-600">{{ a.streetLine }}, {{ a.city }} — {{ a.pincode }}</p>
            <button type="button" class="text-xs text-red-700 underline mt-2" (click)="deleteAddress(a.id)">Remove</button>
          </div>
        }
        <details class="text-sm">
          <summary class="cursor-pointer text-burgundy-700 font-medium">Add new address</summary>
          <div class="mt-3 space-y-2">
            <input class="input-field" placeholder="Label e.g. Home" [(ngModel)]="addrForm.label" name="al" />
            <input class="input-field" placeholder="Full name" [(ngModel)]="addrForm.fullName" name="an" />
            <input class="input-field" placeholder="Phone" [(ngModel)]="addrForm.phone" name="ap" />
            <input class="input-field" placeholder="Street" [(ngModel)]="addrForm.streetLine" name="as" />
            <input class="input-field" placeholder="City" [(ngModel)]="addrForm.city" name="ac" />
            <input class="input-field" placeholder="Pincode" [(ngModel)]="addrForm.pincode" name="az" />
            <label class="flex items-center gap-2"><input type="checkbox" [(ngModel)]="addrForm.defaultAddress" name="ad" /> Default</label>
            <button type="button" class="btn-secondary" (click)="saveAddress()">Save address</button>
          </div>
        </details>
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
  private addressService = inject(AddressService);

  readonly addresses = signal<SavedAddress[]>([]);
  addrForm = {
    label: 'Home',
    fullName: '',
    phone: '',
    streetLine: '',
    city: 'Coimbatore',
    pincode: '',
    defaultAddress: true,
  };

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
      this.addrForm.fullName = p.fullName;
      this.addrForm.phone = p.phone ?? '';
    });
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.addressService.list().subscribe((list) => this.addresses.set(list));
  }

  saveAddress(): void {
    this.addressService.create(this.addrForm).subscribe({
      next: () => {
        this.loadAddresses();
        this.message.set('Address saved.');
        this.success.set(true);
      },
      error: () => this.message.set('Could not save address.'),
    });
  }

  deleteAddress(id: string): void {
    this.addressService.delete(id).subscribe(() => this.loadAddresses());
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
