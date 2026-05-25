# Deploy Hilaz Hanger — Step by Step (DB + API + UI)

Total time: ~30 minutes. You need free accounts on **GitHub**, **Render**, and **Vercel**.

---

## Step 0 — Push code to GitHub

Open **PowerShell** in `c:\webpage`:

```powershell
cd c:\webpage
git init
git add .
git commit -m "Hilaz Hanger — initial deploy"
```

Create a new repo on GitHub: https://github.com/new  
Name it e.g. `hilaz-hanger` (empty, no README).

Then:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/hilaz-hanger.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 1 — Deploy Database + Backend (Render)

### A. One-click Blueprint (recommended)

1. Go to https://dashboard.render.com/
2. Sign up / log in → connect **GitHub**.
3. Click **New +** → **Blueprint**.
4. Select your `hilaz-hanger` repository.
5. Render reads `render.yaml` and creates:
   - **PostgreSQL** database `hilaz-hanger-db`
   - **Web service** `hilaz-hanger-api` (Docker)
6. Click **Apply**.

### B. Set environment variables (Render → hilaz-hanger-api → Environment)

| Key | Value | Required |
|-----|--------|----------|
| `JWT_SECRET` | Auto-generated ✓ | Yes |
| `DATABASE_URL` | From database ✓ | Yes |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:4200` (add Vercel URL after Step 2) | Yes |
| `CLOUDINARY_CLOUD_NAME` | From cloudinary.com dashboard | For image upload |
| `CLOUDINARY_API_KEY` | Cloudinary | For image upload |
| `CLOUDINARY_API_SECRET` | Cloudinary | For image upload |
| `RAZORPAY_KEY_ID` | `rzp_test_...` | For online pay |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | For online pay |

7. Wait for deploy (first build ~5–10 min on free tier).
8. Copy your API URL, e.g. `https://hilaz-hanger-api.onrender.com`
9. Test: open `https://hilaz-hanger-api.onrender.com/api/health`  
   You should see: `{"status":"ok","app":"Hilaz Hanger API"}`

### Demo logins (created automatically on first API start)

- Admin: `admin@hilazhanger.com` / `Admin@123`
- Customer: `customer@hilazhanger.com` / `Customer@123`

---

## Step 2 — Deploy Frontend UI (Vercel)

1. Go to https://vercel.com/ → sign up with **GitHub**.
2. **Add New…** → **Project** → import `hilaz-hanger`.
3. Configure:

| Setting | Value |
|---------|--------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Other |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist/hilaz-hanger/browser` |
| **Install Command** | `npm install` |

4. Before deploy, edit production API URL in the repo (or edit on GitHub):

   File: `frontend/src/environments/environment.prod.ts`

   ```typescript
   apiUrl: 'https://hilaz-hanger-api.onrender.com/api',  // YOUR Render URL
   razorpayKey: 'rzp_test_xxxxx',  // your Razorpay key id
   useMock: false,
   ```

   Commit and push if you changed it:

   ```powershell
   git add frontend/src/environments/environment.prod.ts
   git commit -m "Set production API URL"
   git push
   ```

5. Click **Deploy**.
6. Copy your Vercel URL, e.g. `https://hilaz-hanger.vercel.app`

---

## Step 3 — Connect frontend ↔ backend (CORS)

1. Render → **hilaz-hanger-api** → **Environment**
2. Update `APP_CORS_ALLOWED_ORIGINS`:

   ```
   https://hilaz-hanger.vercel.app,http://localhost:4200
   ```

   (Use your real Vercel URL.)

3. **Save Changes** → Render redeploys the API.

---

## Step 4 — Verify everything

| Check | URL / action |
|-------|----------------|
| API health | `https://YOUR-API.onrender.com/api/health` |
| Shop UI | `https://YOUR-APP.vercel.app/shop` |
| Login | customer@hilazhanger.com / Customer@123 |
| Admin | admin@hilazhanger.com / Admin@123 → `/admin` |

---

## Troubleshooting

### API fails to start / DB connection error
- Render → Database → **Connections** → confirm `DATABASE_URL` is linked to the web service.
- Check API **Logs** on Render for the exact error.

### Shop empty / network errors
- Confirm `environment.prod.ts` `apiUrl` ends with `/api`.
- Confirm CORS includes your Vercel URL.
- Free Render API sleeps after 15 min — first request may take ~30s.

### Vercel build fails
- Root directory must be `frontend`.
- Output must be `dist/hilaz-hanger/browser`.

### Image upload fails
- Set all three Cloudinary env vars on Render.

---

## Optional: redeploy after changes

```powershell
git add .
git commit -m "Update"
git push
```

Render and Vercel auto-redeploy from `main`.

---

## Architecture

```
[Vercel]  Angular UI  ──HTTPS──►  [Render] Spring Boot API
                                        │
                                        ▼
                                 [Render] PostgreSQL
```
