import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-12 text-center">
      <p class="text-4xl mb-4">♡</p>
      <h1 class="font-serif text-2xl font-bold text-burgundy-900">Saved Items</h1>
      <p class="text-gray-500 mt-2 mb-6">Your wishlist is empty. Start exploring our collection.</p>
      <a routerLink="/shop" class="btn-primary inline-block">Browse Shop</a>
    </div>
  `,
})
export class SavedComponent {}
