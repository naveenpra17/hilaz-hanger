import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    @if (order(); as o) {
      <div class="page-container-narrow page-section pb-20">
        <a routerLink="/orders" class="text-sm text-burgundy-600 mb-4 inline-block">← My orders</a>
        <h1 class="font-serif text-2xl font-bold">{{ o.orderNumber }}</h1>
        <p class="text-sm text-gray-500">{{ o.createdAt | date: 'medium' }}</p>
        <p class="mt-2"><span class="text-xs px-2 py-1 rounded-full bg-burgundy-100">{{ o.status }}</span></p>
        <ul class="section-card mt-6 space-y-2 text-sm">
          @for (item of o.items; track item.id) {
            <li class="flex justify-between"><span>{{ item.productName }} × {{ item.quantity }}</span><span>₹{{ item.lineTotal }}</span></li>
          }
        </ul>
        <div class="mt-4 text-sm space-y-1">
          <div class="flex justify-between"><span>Subtotal</span><span>₹{{ o.subtotal }}</span></div>
          @if (o.discount > 0) { <div class="flex justify-between text-green-700"><span>Discount</span><span>−₹{{ o.discount }}</span></div> }
          <div class="flex justify-between font-bold"><span>Total</span><span>₹{{ o.total }}</span></div>
        </div>
      </div>
    }
  `,
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  readonly order = signal<Order | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.orderService.getOrder(id).subscribe((o) => this.order.set(o));
  }
}
