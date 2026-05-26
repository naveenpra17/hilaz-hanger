import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CouponService } from '../../../core/services/coupon.service';
import { Coupon } from '../../../core/models/coupon.model';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex justify-between items-center mb-6">
      <p class="text-sm text-gray-600">Promo codes for checkout</p>
      <button type="button" class="btn-gold text-sm" (click)="showForm.set(true)">+ New coupon</button>
    </div>

    @if (showForm()) {
      <form class="section-card mb-6 space-y-3" (ngSubmit)="save()">
        <h3 class="font-semibold text-burgundy-800">{{ editingId() ? 'Edit' : 'Create' }} coupon</h3>
        <input class="input-field" placeholder="Code e.g. SUMMER20" [(ngModel)]="form.code" name="code" [disabled]="!!editingId()" required />
        <select class="input-field" [(ngModel)]="form.discountType" name="type">
          <option value="PERCENT">Percent off</option>
          <option value="FIXED">Fixed ₹ off</option>
        </select>
        <input class="input-field" type="number" placeholder="Value (10 = 10% or ₹10)" [(ngModel)]="form.discountValue" name="val" required />
        <input class="input-field" type="number" placeholder="Min order ₹" [(ngModel)]="form.minOrderAmount" name="min" />
        <input class="input-field" type="number" placeholder="Max uses (optional)" [(ngModel)]="form.maxUses" name="max" />
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" [(ngModel)]="form.active" name="active" /> Active</label>
        <div class="flex gap-2">
          <button type="submit" class="btn-primary flex-1">Save</button>
          <button type="button" class="border px-4 rounded-xl" (click)="cancelForm()">Cancel</button>
        </div>
      </form>
    }

    <div class="space-y-3">
      @for (c of coupons(); track c.id) {
        <article class="section-card flex flex-wrap justify-between gap-3 items-center">
          <div>
            <p class="font-mono font-bold text-burgundy-900">{{ c.code }}</p>
            <p class="text-sm text-gray-600">
              {{ c.discountType === 'PERCENT' ? c.discountValue + '%' : '₹' + c.discountValue }} off
              · min ₹{{ c.minOrderAmount ?? 0 }}
              · used {{ c.usedCount }}{{ c.maxUses ? '/' + c.maxUses : '' }}
            </p>
          </div>
          <div class="flex gap-2">
            <button type="button" class="text-xs text-burgundy-700 underline" (click)="edit(c)">Edit</button>
            <button type="button" class="text-xs text-red-700 underline" (click)="remove(c.id)">Delete</button>
          </div>
        </article>
      }
    </div>

    <p class="text-xs text-gray-500 mt-6">Seeded codes: <strong>WELCOME10</strong> (10% off ₹500+), <strong>SAVE100</strong> (₹100 off ₹999+)</p>
  `,
})
export class CouponsComponent implements OnInit {
  private readonly couponService = inject(CouponService);

  readonly coupons = signal<Coupon[]>([]);
  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);

  form = {
    code: '',
    discountType: 'PERCENT' as 'PERCENT' | 'FIXED',
    discountValue: 10,
    minOrderAmount: 0,
    maxUses: undefined as number | undefined,
    active: true,
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.couponService.listAdmin().subscribe((list) => this.coupons.set(list));
  }

  edit(c: Coupon): void {
    this.editingId.set(c.id);
    this.form = {
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount ?? 0,
      maxUses: c.maxUses,
      active: c.active,
    };
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form = { code: '', discountType: 'PERCENT', discountValue: 10, minOrderAmount: 0, maxUses: undefined, active: true };
  }

  save(): void {
    const id = this.editingId();
    const body = {
      code: this.form.code.toUpperCase(),
      discountType: this.form.discountType,
      discountValue: this.form.discountValue,
      minOrderAmount: this.form.minOrderAmount,
      maxUses: this.form.maxUses,
      active: this.form.active,
    };
    const req = id ? this.couponService.update(id, body) : this.couponService.create(body);
    req.subscribe({
      next: () => {
        this.cancelForm();
        this.load();
      },
    });
  }

  remove(id: string): void {
    if (!confirm('Delete this coupon?')) return;
    this.couponService.delete(id).subscribe(() => this.load());
  }
}
