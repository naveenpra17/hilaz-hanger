# Hilaz Hanger — Store Operations Guide

This is a **real e-commerce stack**: customers shop and pay online; admins manage catalog and orders. Data is stored in **PostgreSQL** (Render), images in **Cloudinary**, payments via **Razorpay**.

---

## Live URLs

| Service | URL |
|---------|-----|
| **Store (customers)** | https://hilaz-hanger.vercel.app |
| **API** | https://hilaz-hanger-api.onrender.com/api |
| **Admin panel** | https://hilaz-hanger.vercel.app/admin/dashboard |

---

## Where data is stored

| Data | Location |
|------|----------|
| Users, products, variants, stock, orders | **PostgreSQL** on Render (`hilaz-hanger-db`) |
| Product photos | **Cloudinary** (`hilaz-hanger/products` folder) |
| Shopping cart (before checkout) | Customer browser **localStorage** only |
| Payment records | Razorpay dashboard + `orders` table (`razorpay_order_id`, `razorpay_payment_id`) |

---

## Required secrets (Render → hilaz-hanger-api → Environment)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres (auto from Render DB) |
| `JWT_SECRET` | Login tokens |
| `RAZORPAY_KEY_ID` | e.g. `rzp_test_xxxx` or live `rzp_live_xxxx` |
| `RAZORPAY_KEY_SECRET` | From [Razorpay Dashboard](https://dashboard.razorpay.com/) → API Keys |
| `CLOUDINARY_CLOUD_NAME` | Image uploads |
| `CLOUDINARY_API_KEY` | Image uploads |
| `CLOUDINARY_API_SECRET` | Image uploads |
| `APP_CORS_ALLOWED_ORIGINS` | `https://hilaz-hanger.vercel.app,https://*.vercel.app,http://localhost:4200` |

**Razorpay test mode:** Use test keys; pay with Razorpay test UPI/card in checkout.

**Go live:** Replace with `rzp_live_*` keys and complete Razorpay KYC.

---

## Admin login

1. Open https://hilaz-hanger.vercel.app/login?admin=true  
2. Email: `admin@hilazhanger.com`  
3. Password: `Admin@123`  
4. Change this password after first login (register a new admin user in DB or update `users` table).

> Do **not** use “offline demo” mode — it does not call the API. Always log in with real credentials.

---

## Add a product (catalog)

1. **Admin → Products → + Create Product**
2. **Upload image** (file → Cloudinary) or paste image URL
3. **Selling price** — what customers pay  
4. **Original price** — optional; if higher than selling price, storefront shows **sale** (strikethrough + % off)
5. **Sizes** — add S, M, L, etc.
6. **Default stock per size** — inventory for checkout (each size becomes a variant)
7. **Labels** — e.g. `NEW ARRIVAL`, `FLASH SALE`, `BESTSELLER`
8. **Active** — uncheck to hide from shop
9. **Create Product**

### Run a sale

- Set **Original price** = old MRP (e.g. ₹1999)  
- Set **Selling price** = sale price (e.g. ₹1499)  
- Add label `FLASH SALE` (optional, visual only)

### Remove a product

- **Admin → Products** → **Delete** on the row (permanent).

### Update price or stock

- **Edit Product** → change prices or sizes/stock → **Update**  
- Updating sizes recreates variants with the default stock value you set.

---

## Customer purchase flow

1. Browse **Shop** → product page → choose size → **Add to cart**
2. **Cart** → **Checkout** (must **register/login**)
3. Enter shipping address
4. Payment:
   - **UPI / Card** → Razorpay popup → pay → order confirmed
   - **Cash on Delivery** → order confirmed without online payment
5. Order saved in PostgreSQL; stock reduced per variant

---

## Orders (admin)

- **Dashboard** — revenue stats, recent orders, **Mark Paid** for unpaid orders  
- **Orders** — list all orders  
- **+ Add Offline Order** — WhatsApp / walk-in / phone orders with discount and paid/delivered flags  

Offline orders use the same `orders` table as website orders.

---

## Payment gateway checklist

- [ ] `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` set on Render  
- [ ] API redeployed after setting keys  
- [ ] Test checkout with **UPI (Razorpay)** using Razorpay test mode  
- [ ] `POST /api/orders/verify-payment` succeeds after payment (order shows paid in admin)  
- [ ] COD works without Razorpay keys  

If checkout says “Razorpay is not configured”, keys are missing or still placeholders.

---

## Image uploads

Requires all three Cloudinary env vars on Render. Without them, paste a direct image URL in the product form instead.

---

## Local development

```powershell
# Database
docker compose up -d

# API (port 8080, context /api)
cd backend
# set .env from .env.example

# UI
cd frontend
npm install
npm start
```

API: http://localhost:8080/api/health  
UI: http://localhost:4200  

---

## Architecture

```
Customer (Vercel)  ──HTTPS──►  Spring API (Render)  ──►  PostgreSQL (Render)
                                    │
                                    ├── Cloudinary (images)
                                    └── Razorpay (payments)
```

---

## What is not built yet (roadmap)

- Promo / coupon codes (table exists, no API)
- Customer order history page
- Email/SMS order confirmations
- Razorpay webhooks (verification is client + API today)
- Multi-image gallery in admin (single primary image supported)
- Ship / cancel order buttons in admin UI

For day-to-day selling: **products, stock, sales pricing, Razorpay, COD, admin orders, and Cloudinary uploads are supported.**
