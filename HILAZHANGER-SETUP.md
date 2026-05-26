# HILAZ HANGER — Production setup checklist

Official site: **https://hilazhanger.shop**  
Instagram: **@thehilaz.hanger**

## Code changes included

- All policy pages with your official copy (About, FAQ, Privacy, Shipping, Returns, Terms, Size Guide)
- **COD removed** — website checkout is prepaid only (Razorpay)
- Brand contact: +91 6383799574, Coimbatore address
- WhatsApp float + Instagram links
- Sitemap includes products and policy pages
- Meta Pixel + Google Analytics hooks (set IDs in Vercel)
- Contact form spam honeypot
- Vercel cache headers to reduce stale JS chunk errors

## Vercel (frontend)

1. Connect repo, root: `frontend`
2. Environment variables:
   - `NG_APP_GA_MEASUREMENT_ID` = your GA4 ID (e.g. `G-XXXXXXXX`)
   - `NG_APP_META_PIXEL_ID` = your Meta Pixel ID
3. Custom domain: `hilazhanger.shop` → follow Vercel DNS instructions
4. Enable **SSL** (automatic on Vercel)

## Render (API)

1. Set `APP_FRONTEND_URL=https://hilazhanger.shop`
2. Set `APP_CORS_ALLOWED_ORIGINS=https://hilazhanger.shop,https://www.hilazhanger.shop`
3. Store env (match brand):
   - `APP_STORE_PHONE=+916383799574`
   - `APP_STORE_WHATSAPP=+916383799574`
   - `APP_STORE_INSTAGRAM=https://www.instagram.com/thehilaz.hanger`
   - `APP_STORE_ADDRESS=338, Kalaingar Nagar, Chettipalayam, Coimbatore – 641201, Tamil Nadu, India`
4. Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (required — no COD fallback)
5. Cloudinary for product images

## Cloudflare (recommended)

1. Add site `hilazhanger.shop` to Cloudflare
2. Point DNS to Vercel (or proxy through Cloudflare)
3. SSL/TLS: **Full (strict)**
4. Enable: Bot Fight Mode, Browser Integrity Check
5. Page Rules: cache static assets, bypass cache for `index.html`

## Google Search Console

1. Add property `https://hilazhanger.shop`
2. Verify via DNS TXT or HTML file
3. Submit sitemap: `https://hilaz-hanger-api.onrender.com/api/sitemap.xml`  
   (or proxy sitemap on frontend domain if you add a rewrite)

## Meta Pixel

1. Events Manager → create Pixel
2. Copy Pixel ID → Vercel `NG_APP_META_PIXEL_ID`
3. Redeploy frontend

## Admin access recovery

1. Render → `APP_SEED_ADMIN_EMAIL` + `APP_SEED_ADMIN_PASSWORD` (only for first boot / new DB)
2. Or use **Forgot password** on `/forgot-password` (requires SMTP on API)
3. Keep admin email secure; do not share JWT tokens

## Daily backups

- **Render PostgreSQL**: enable automatic backups on paid plan, or schedule `pg_dump` to cloud storage
- Export product images from Cloudinary periodically

## After deploy — test

- [ ] Home, Shop, Product page, Cart, Checkout (Razorpay test mode)
- [ ] COD option **not** visible at checkout
- [ ] Order appears in Admin → Orders
- [ ] All footer policy links open
- [ ] WhatsApp opens with correct number
- [ ] `https://hilazhanger.shop/robots.txt` and sitemap reachable
