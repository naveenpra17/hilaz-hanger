import { Component, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { DashboardStats } from '../../../core/models/order.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (stats(); as s) {
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div class="section-card">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold">Monthly Orders</h3>
            <div class="flex gap-1 text-xs">
              @for (t of ['Day','Week','Month','Year']; track t) {
                <button type="button" class="px-2 py-1 rounded" [class.bg-burgundy-800]="t === 'Month'" [class.text-white]="t === 'Month'" [class.text-gray-500]="t !== 'Month'">{{ t }}</button>
              }
            </div>
          </div>
          <div class="flex items-end gap-3 h-32">
            @for (bar of s.monthlyOrders; track bar.label) {
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full bg-gold/60 rounded-t" [style.height.%]="barHeight(bar.count)"></div>
                <span class="text-[10px] text-gray-500">{{ bar.label }}</span>
              </div>
            }
          </div>
        </div>

        <div class="section-card">
          <h3 class="font-semibold mb-4">Top Customers</h3>
          @for (c of s.topCustomers; track c.name) {
            <div class="mb-3">
              <div class="flex justify-between text-sm mb-1">
                <span>{{ c.name }}</span>
                <span class="font-medium">₹{{ (c.revenue / 1000).toFixed(1) }}K</span>
              </div>
              <div class="h-2 bg-cream-dark rounded-full overflow-hidden">
                <div class="h-full bg-burgundy-400 rounded-full" [style.width.%]="(c.revenue / maxRevenue()) * 100"></div>
              </div>
            </div>
          }
        </div>

        <div class="section-card flex flex-col items-center">
          <h3 class="font-semibold mb-4 self-start">Order Status</h3>
          <div class="relative w-28 h-28 rounded-full border-8 border-burgundy-200 flex items-center justify-center">
            <span class="text-2xl font-bold">{{ s.totalOrders }}</span>
          </div>
          <div class="mt-4 space-y-1 text-xs w-full">
            @for (item of s.orderStatusBreakdown; track item.status) {
              <div class="flex justify-between"><span>{{ item.status }}</span><span>{{ item.count }}</span></div>
            }
          </div>
        </div>

        <div class="section-card flex flex-col items-center">
          <h3 class="font-semibold mb-4 self-start">Payment Status</h3>
          <div class="relative w-28 h-28 rounded-full border-8 border-gold/50 flex items-center justify-center">
            <span class="text-2xl font-bold">{{ s.totalOrders }}</span>
          </div>
          <div class="mt-4 space-y-1 text-xs w-full">
            @for (item of s.paymentStatusBreakdown; track item.status) {
              <div class="flex justify-between"><span>{{ item.status }}</span><span>{{ item.count }}</span></div>
            }
          </div>
        </div>
      </div>

      <div class="section-card overflow-x-auto">
        <h3 class="font-semibold mb-4">Recent Orders</h3>
        <table class="w-full text-sm min-w-[600px]">
          <thead>
            <tr class="text-left text-gray-500 border-b">
              <th class="pb-2">Order ID</th>
              <th class="pb-2">Customer</th>
              <th class="pb-2">Date</th>
              <th class="pb-2">Total</th>
              <th class="pb-2">Payment</th>
            </tr>
          </thead>
          <tbody>
            @for (o of s.recentOrders; track o.id) {
              <tr class="border-b border-gray-100">
                <td class="py-3 font-mono text-xs">{{ o.orderNumber }}</td>
                <td>{{ o.customerName }}</td>
                <td>{{ formatDate(o.createdAt) }}</td>
                <td class="font-medium">₹{{ o.total }}</td>
                <td>
                  @if (o.paid) {
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Paid</span>
                  } @else {
                    <button type="button" class="text-xs bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full" (click)="markPaid(o.id)">Mark Paid</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  readonly stats = signal<DashboardStats | null>(null);

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getDashboard().subscribe((s) => this.stats.set(s));
  }

  barHeight(count: number): number {
    const max = Math.max(...(this.stats()?.monthlyOrders.map((b) => b.count) ?? [1]), 1);
    return (count / max) * 100;
  }

  maxRevenue(): number {
    return Math.max(...(this.stats()?.topCustomers.map((c) => c.revenue) ?? [1]), 1);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  markPaid(id: string): void {
    this.orderService.markPaid(id).subscribe(() => {
      this.orderService.getDashboard().subscribe((s) => this.stats.set(s));
    });
  }
}
