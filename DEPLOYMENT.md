# Deployment Guide — Hilaz Hanger

## Phase 4: Vercel (Frontend) + Render (Backend)

### Prerequisites

- GitHub repo with this project
- [Vercel](https://vercel.com) account
- [Render](https://render.com) account
- [Cloudinary](https://cloudinary.com) account (image upload)
- [Razorpay](https://razorpay.com) test/live keys (payments)

---

## 1. Deploy Backend (Render)

### Option A — Blueprint

1. Push code to GitHub.
2. Render Dashboard → **New** → **Blueprint** → connect repo.
3. Use root `render.yaml` (adjust `APP_CORS_ALLOWED_ORIGINS` to your Vercel URL).
4. Set manual env vars in Render:
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
5. Deploy. Note API URL: `https://hilaz-hanger-api.onrender.com`

### Option B — Docker Web Service

1. New **Web Service** → Docker.
2. Root directory: `backend`
3. Dockerfile path: `Dockerfile`
4. Add PostgreSQL database and link `SPRING_DATASOURCE_*` vars.

### Health check

`GET https://YOUR-API.onrender.com/api/health` → `{ "status": "ok" }`

### Demo users (auto-seeded on first run)

- Admin: `admin@hilazhanger.com` / `Admin@123`
- Customer: `customer@hilazhanger.com` / `Customer@123`

---

## 2. Deploy Frontend (Vercel)

1. Vercel → **Add New Project** → import GitHub repo.
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist/hilaz-hanger/browser`
5. **Environment variables:**

| Name | Value |
|------|--------|
| `NG_APP_API_URL` | `https://YOUR-API.onrender.com/api` |

6. Update `frontend/src/environments/environment.prod.ts` `apiUrl` to match, or use build-time replacement (see below).

### `environment.prod.ts`

Set before deploy:

```typescript
apiUrl: 'https://hilaz-hanger-api.onrender.com/api',
razorpayKey: 'rzp_live_XXXXX', // or rzp_test_ for staging
useMock: false,
```

### CORS on Render

Set `APP_CORS_ALLOWED_ORIGINS` to your Vercel URL, e.g.:

```
https://hilaz-hanger.vercel.app,http://localhost:4200
```

---

## 3. Cloudinary (Phase 3)

1. Create upload preset or use default.
2. Add to Render env:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Admin → Create Product → upload image (calls `POST /api/admin/upload/image`).

---

## 4. Razorpay (Phase 2)

1. Dashboard → API Keys (Test mode for staging).
2. Render env:
   - `RAZORPAY_KEY_ID=rzp_test_...`
   - `RAZORPAY_KEY_SECRET=...`
3. Frontend `environment.prod.ts`:
   - `razorpayKey: 'rzp_test_...'` (same Key ID, public)
4. Checkout flow:
   - **COD** → order created without Razorpay.
   - **UPI/Card** → Razorpay modal → `POST /api/orders/verify-payment`.

---

## 5. Local full stack

```powershell
# Terminal 1 — DB
docker compose up -d postgres

# Terminal 2 — API (needs Java 17 + Maven)
cd backend
$env:JWT_SECRET="local-dev-secret-key-min-32-characters-long"
$env:RAZORPAY_KEY_ID="rzp_test_xxx"
$env:RAZORPAY_KEY_SECRET="xxx"
mvn spring-boot:run

# Terminal 3 — Frontend
cd frontend
npm.cmd install
npm.cmd start
```

Frontend `environment.ts` already has `useMock: false` and `apiUrl: http://localhost:8080/api`.

---

## Checklist

- [ ] Render API healthy `/api/health`
- [ ] Vercel site loads
- [ ] Login works (customer + admin)
- [ ] Shop loads products from API
- [ ] Checkout COD works
- [ ] Razorpay test payment works
- [ ] Admin image upload works (Cloudinary)
- [ ] CORS allows Vercel origin
