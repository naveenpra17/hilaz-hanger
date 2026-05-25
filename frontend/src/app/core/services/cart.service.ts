import { Injectable, signal, computed } from '@angular/core';
import { Cart, CartItem } from '../models/cart.model';

const CART_KEY = 'hilaz_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsSignal = signal<CartItem[]>(this.load());

  readonly items = this.itemsSignal.asReadonly();
  readonly itemCount = computed(() =>
    this.itemsSignal().reduce((sum, i) => sum + i.quantity, 0)
  );
  readonly subtotal = computed(() =>
    this.itemsSignal().reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  );

  addItem(item: Omit<CartItem, 'id'>): void {
    const items = [...this.itemsSignal()];
    const existing = items.find((i) => i.variantId === item.variantId);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + item.quantity, existing.stockQuantity);
    } else {
      items.push({ ...item, id: crypto.randomUUID() });
    }
    this.persist(items);
  }

  updateQuantity(id: string, quantity: number): void {
    const items = this.itemsSignal()
      .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stockQuantity)) } : i))
      .filter((i) => i.quantity > 0);
    this.persist(items);
  }

  removeItem(id: string): void {
    this.persist(this.itemsSignal().filter((i) => i.id !== id));
  }

  clear(): void {
    this.persist([]);
  }

  private persist(items: CartItem[]): void {
    this.itemsSignal.set(items);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }
}
