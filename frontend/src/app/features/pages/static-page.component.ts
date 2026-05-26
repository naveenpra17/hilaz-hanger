import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

const PAGES: Record<string, { title: string; body: string }> = {
  privacy: {
    title: 'Privacy Policy',
    body: `We collect only information needed to process orders (name, email, phone, shipping address). Payment data is handled securely by Razorpay — we do not store card details. We do not sell your data to third parties. Contact hello@hilazhanger.com for data requests.`,
  },
  terms: {
    title: 'Terms & Conditions',
    body: `By using Hilaz Hanger you agree to our pricing, shipping timelines, and return policy. All sales are subject to product availability. We reserve the right to cancel orders in case of pricing errors or stock issues.`,
  },
  shipping: {
    title: 'Shipping Policy',
    body: `Orders ship within 2–5 business days across India. Free shipping on orders ₹999 and above. Standard shipping ₹99 below ₹999. Express shipping available on select products.`,
  },
  returns: {
    title: 'Return & Exchange',
    body: `Unworn items with tags may be exchanged within 7 days of delivery. Contact us on WhatsApp or email with your order number. Sale items are final sale unless defective.`,
  },
  about: {
    title: 'About Hilaz Hanger',
    body: `Hilaz Hanger is a premium fashion boutique based in Coimbatore, curating elegant ethnic and contemporary wear for the modern woman.`,
  },
  faq: {
    title: 'FAQ',
    body: `Q: How do I track my order?\nA: Log in and visit My Orders.\n\nQ: What payment methods do you accept?\nA: UPI, cards via Razorpay, and Cash on Delivery.\n\nQ: Can I use a coupon?\nA: Yes — enter your code at checkout.`,
  },
};

@Component({
  selector: 'app-static-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-container-narrow page-section pb-20">
      <a routerLink="/" class="text-sm text-burgundy-600 mb-4 inline-block">← Home</a>
      <h1 class="font-serif text-2xl font-bold text-burgundy-900 mb-6">{{ page()?.title }}</h1>
      <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">{{ page()?.body }}</div>
    </div>
  `,
})
export class StaticPageComponent {
  private route = inject(ActivatedRoute);
  readonly page = toSignal(
    this.route.paramMap.pipe(
      map((p) => PAGES[p.get('slug') ?? ''] ?? { title: 'Page', body: 'Content not found.' })
    ),
    { initialValue: PAGES['about'] }
  );
}
