# Vercel Deployment Guide — Pune Live Traffic

## You will deploy 2 separate Vercel projects:
- **Frontend** → `pune-live-traffic` (Next.js)
- **Backend** → `pune-live-traffic-api` (Node.js/Express)

---

## Step 1 — Deploy Backend API

1. Go to vercel.com → New Project → Import `backend/` folder
2. Set Framework Preset to **Other**
3. Add these Environment Variables in Vercel Dashboard:

### Backend Environment Variables

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql://neondb_owner:...@pooler.../neondb?sslmode=require` |
| `DATABASE_URL_UNPOOLED` | `postgresql://neondb_owner:...@direct.../neondb?sslmode=require` |
| `JWT_SECRET` | Generate a strong random string |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_1a3PrH7tRo9yTrXQ_...` |
| `TOMTOM_API_KEY` | Your TomTom key |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` |
| `NODE_ENV` | `production` |

4. Deploy → Copy the backend URL e.g. `https://pune-live-traffic-api.vercel.app`

---

## Step 2 — Deploy Frontend

1. Go to vercel.com → New Project → Import `frontend/` folder
2. Set Framework Preset to **Next.js**
3. Add these Environment Variables:

### Frontend Environment Variables

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://pune-live-traffic-api.vercel.app/api` |
| `NEXT_PUBLIC_WS_URL` | `wss://pune-live-traffic-api.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_1a3PrH7tRo9yTrXQ_...` |
| `NEXT_PUBLIC_TOMTOM_API_KEY` | Your TomTom key |
| `NEXT_PUBLIC_APP_URL` | `https://your-frontend.vercel.app` |

4. Deploy → Your app is live!

---

## Step 3 — After Deployment

Update backend `FRONTEND_URL` to the actual frontend Vercel URL (for CORS).

---

## Local vs Production URLs

| Setting | Local | Production |
|---|---|---|
| Frontend | `http://localhost:3000` | `https://pune-live-traffic.vercel.app` |
| Backend API | `http://localhost:3001/api` | `https://pune-live-traffic-api.vercel.app/api` |
| Database | Same Neon DB | Same Neon DB |
| Blob Storage | Same Vercel Blob | Same Vercel Blob |

---

## ⚠️ Security Checklist Before Deploy

- [ ] Change `JWT_SECRET` to a strong 32+ char random string
- [ ] Reset Neon DB password (shared in chat — regenerate it)
- [ ] Reset Vercel Blob token (shared in chat — regenerate it)
- [ ] Set `NODE_ENV=production` in backend
