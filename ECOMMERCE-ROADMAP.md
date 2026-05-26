# Hilaz Hanger — Full E-Commerce Roadmap

## Already built (your store today)

| Area | Features |
|------|----------|
| **Catalog** | Products, variants, stock, categories, search, filters, related products |
| **Storefront** | Home, shop, PDP, cart, wishlist, reviews |
| **Checkout** | Guest + logged-in, coupons, shipping (free ₹999+), Razorpay, COD |
| **Orders** | My orders, order detail, admin orders, ship/cancel/deliver |
| **Admin** | Products (multi-image), coupons, dashboard, offline orders |
| **Account** | Profile, change password |
| **Trust** | Privacy, terms, shipping, returns, FAQ, contact form |
| **Marketing** | Newsletter signup in footer |
| **Notifications** | Email + SMS (configurable on Render) |

---

## Still recommended for “enterprise” level (not yet built)

| Priority | Feature | Why |
|----------|---------|-----|
| **High** | Razorpay **webhooks** | Confirm payments if user closes browser |
| **High** | **GST / tax** on invoice | Legal requirement in India for many sellers |
| **High** | **PDF invoices** + download | Customers & accounting |
| **High** | **Forgot password** (email link) | Support load |
| **Medium** | **Address book** (saved addresses) | Repeat buyers |
| **Medium** | **Categories admin** UI | Merchandising without DB |
| **Medium** | **Razorpay refunds** API | Real money back on cancel |
| **Medium** | **Google Analytics** | Marketing ROI |
| **Medium** | **SEO** per product (meta, sitemap) | Organic traffic |
| **Low** | Abandoned cart emails | Recovery |
| **Low** | Live chat / WhatsApp order bot | Support |
| **Low** | Multi-currency / i18n | Export |

---

## Deploy checklist after this update

1. **Render** — redeploy API (new tables: `newsletter_subscribers`, `coupon_code` on orders)
2. **Vercel** — redeploy frontend
3. Test: guest checkout, wishlist, review, shipping ₹99/₹0, legal pages, newsletter

See [OPERATIONS.md](./OPERATIONS.md) for day-to-day admin use.
