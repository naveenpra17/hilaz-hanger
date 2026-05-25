import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-footer-gradient text-white mt-auto">
      <div class="max-w-7xl mx-auto px-4 py-10 text-center">
        <div class="w-14 h-14 rounded-full bg-white mx-auto flex items-center justify-center text-burgundy-800 font-serif font-bold text-xl mb-3">H</div>
        <p class="text-sm text-white/90 mb-4">Your one-stop destination for premium fashion.</p>
        <div class="flex justify-center gap-3 mb-8">
          <a href="https://instagram.com" target="_blank" rel="noopener" class="w-10 h-10 rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/10">IG</a>
          <a href="https://wa.me" target="_blank" rel="noopener" class="w-10 h-10 rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/10">WA</a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-sm mb-8">
          <div class="bg-white/5 rounded-xl p-4">
            <h4 class="font-semibold mb-2 text-gold-light">Support</h4>
            <ul class="space-y-1 text-white/80">
              <li><a href="#" class="hover:text-white">FAQ</a></li>
              <li><a href="#" class="hover:text-white">Return & Exchange</a></li>
              <li><a href="#" class="hover:text-white">Shipping</a></li>
              <li><a href="#" class="hover:text-white">Size Charts</a></li>
            </ul>
          </div>
          <div class="bg-white/5 rounded-xl p-4">
            <h4 class="font-semibold mb-2 text-gold-light">Legal</h4>
            <ul class="space-y-1 text-white/80">
              <li><a href="#" class="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" class="hover:text-white">Terms & Conditions</a></li>
              <li><a routerLink="/" class="hover:text-white">About Us</a></li>
            </ul>
          </div>
          <div class="bg-white/5 rounded-xl p-4">
            <h4 class="font-semibold mb-2 text-gold-light">Contact</h4>
            <p class="text-white/80 text-xs leading-relaxed">📍 Coimbatore, India</p>
            <p class="text-white/80 text-xs">✉ hello&#64;hilazhanger.com</p>
            <p class="text-white/80 text-xs">📞 +91 98765 43210</p>
          </div>
        </div>

        <p class="text-xs text-white/60">© Hilaz Hanger 2024 — All Rights Reserved</p>
      </div>
      <a href="https://wa.me" class="fixed bottom-20 right-4 lg:bottom-6 w-12 h-12 bg-burgundy-900 rounded-full shadow-lg flex items-center justify-center text-white text-xl z-30" aria-label="Chat">💬</a>
    </footer>
  `,
})
export class SiteFooterComponent {}
