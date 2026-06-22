# Technology Stack — Pune Live Traffic
> Every technology choice explained with reason, cost, and alternatives considered

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   USER BROWSER / PWA                 │
│              Next.js Frontend (Vercel)               │
│         Leaflet Map + React Components               │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────────┐
│              Node.js + Express API                   │
│           (Vercel Serverless Functions)              │
│    Auth · Incidents · Routes · Notifications         │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────────┐
        │              │                  │
┌───────▼──────┐ ┌─────▼──────┐ ┌───────▼──────┐
│   Neon DB    │ │Vercel Blob │ │  Redis Cache │
│ (PostgreSQL) │ │  (Photos)  │ │  (Optional)  │
└──────────────┘ └────────────┘ └──────────────┘
                       │
        ┌──────────────┼──────────────────┐
        │              │                  │
┌───────▼──────┐ ┌─────▼──────┐ ┌───────▼──────┐
│ TomTom API   │ │Google OAuth│ │  IMD Weather  │
│(Traffic Data)│ │   (Auth)   │ │     API       │
└──────────────┘ └────────────┘ └──────────────┘
```

---

## Frontend

### Next.js 14 (App Router)
**Why:** Server-side rendering for fast initial load, SEO for public map pages,
built-in API routes, works perfectly with Vercel deployment.
**Alternative considered:** React + Vite — rejected because no SSR, SEO matters for
public traffic pages that get shared.
**Cost:** Free (open source)
**Version:** 14.x with App Router

### Leaflet.js + React-Leaflet
**Why:** The best open-source map library. Lightweight (42KB), works on mobile,
supports custom tile layers, markers, polygons, and real-time updates.
Does NOT require payment unlike Google Maps JavaScript SDK.
**Alternative considered:** Google Maps JS SDK — rejected because it costs money at scale
and limits customization. Mapbox — rejected because free tier is limited.
**Cost:** Completely free
**Tile source:** OpenStreetMap (free, no API key needed)

### Tailwind CSS
**Why:** Fastest way to build responsive UI. Works perfectly with Next.js.
**Cost:** Free

### Recharts
**Why:** Free charting library for traffic pattern graphs, hourly traffic charts.
Built on top of D3 but much simpler API.
**Cost:** Free

### Socket.io Client
**Why:** For receiving real-time incident updates from the server without polling.
When someone reports an incident in Pune, all connected users see it within seconds.
**Cost:** Free

---

## Backend

### Node.js + Express.js
**Why:** Fast to build REST APIs, huge ecosystem, team knows JavaScript throughout
the full stack (same language as Next.js). Perfect for Vercel serverless deployment.
**Alternative considered:** FastAPI (Python) — rejected because we're already using
JavaScript on frontend, no need for second language.
**Version:** Node.js 20 LTS, Express 4.x
**Cost:** Free

### Socket.io (Server)
**Why:** Real-time bidirectional communication for live incident updates.
When user A reports an incident, user B sees it immediately without refreshing.
**Deployment note:** Socket.io requires persistent connection — deploy separately on
Railway.app (free tier) or use Vercel Edge Functions.
**Cost:** Free (Railway free tier for WebSocket server)

### NextAuth.js
**Why:** The standard authentication library for Next.js. Handles Google OAuth,
JWT sessions, and database user storage out of the box.
**Cost:** Free

---

## Database

### Neon DB (PostgreSQL)
**Why:** Serverless PostgreSQL that scales to zero (no cost when idle).
Connects perfectly to Vercel serverless functions. Has built-in connection pooling
via PgBouncer. Free tier: 0.5GB storage, 1 compute unit.
**Alternative considered:** PlanetScale (MySQL) — rejected because we prefer PostgreSQL
for PostGIS extension (geographic queries). Supabase — good alternative but Neon is
simpler for this use case.
**Cost:** Free tier sufficient for Phase 1–2

### PostGIS Extension (on Neon)
**Why:** Allows geographic queries in PostgreSQL.
Example: "Find all incidents within 2km of user's location" — done in one SQL query.
Without PostGIS this requires complex manual distance calculations.
**Cost:** Free (included with PostgreSQL)

### pgAdmin 4
**Why:** GUI tool to visually manage the Neon DB, run queries, see table data.
**Cost:** Free (desktop application)

---

## File Storage

### Vercel Blob
**Why:** Native integration with Vercel. Users upload incident photos (waterlogging,
potholes, accidents). Vercel Blob stores them and returns a CDN URL.
**Cost:** Free tier: 100GB bandwidth, 1GB storage per month
**Usage:** Incident photos, user profile pictures, PDF reports

---

## External APIs

### TomTom Traffic API
**Why:** Provides real-time traffic tile layers (colored roads), traffic incidents,
and routing. Free tier is sufficient for early stage.
**What we use:**
- Traffic Flow Tile Layer (colors roads by congestion level)
- Traffic Incidents API (accidents, closures reported by TomTom)
- Routing API (A to B route calculation with traffic)
**Cost:** Free — 2,500 requests/day, 50,000 map loads/month
**Upgrade cost:** $0.42 per 1,000 requests beyond free tier

### OpenStreetMap + Nominatim
**Why:** Free map tiles and geocoding (convert address to lat/lng).
Used for base map and location search.
**Cost:** Completely free, no API key needed
**Rate limit:** Nominatim: max 1 request/second (enough for autocomplete)

### Google OAuth (Auth only — NOT Maps)
**Why:** One-click login for users. Most Pune users have Google accounts.
**Cost:** Free (OAuth is free, we are NOT using Google Maps)

### IMD Weather API (Phase 3)
**Why:** India Meteorological Department provides rainfall data for Pune.
Useful for predicting waterlogging risk before it happens.
**Cost:** Free (government API)

### Web Push API (Browser built-in)
**Why:** Send push notifications to users about incidents on their saved routes.
Works without installing an app.
**Cost:** Free (browser native API)

---

## DevOps & Deployment

### Vercel
**Why:** Zero-config deployment for Next.js + Express serverless functions.
Free tier handles Phase 1–3 comfortably.
**What deploys here:**
- Next.js frontend
- Express API as serverless functions
- Vercel Blob (file storage)
**Cost:** Free tier — 100GB bandwidth, serverless function executions

### Railway.app (WebSocket Server only)
**Why:** Vercel serverless functions cannot maintain persistent WebSocket connections
(they timeout after 30 seconds). Railway provides a persistent server for Socket.io.
**Cost:** Free tier: $5 credit/month (enough for small Socket.io server)
**Alternative:** Upgrade to Vercel Pro for Edge Functions with WebSocket support

### GitHub
**Why:** Version control, CI/CD with Vercel (auto-deploy on git push)
**Cost:** Free

---

## Development Tools

| Tool | Purpose | Cost |
|---|---|---|
| VS Code | Code editor | Free |
| pgAdmin 4 | Database GUI | Free |
| Postman | API testing | Free |
| ESLint + Prettier | Code quality | Free |
| Prisma ORM | Database schema + queries | Free |
| TypeScript | Type safety | Free |

---

## Why Prisma ORM?

Instead of writing raw SQL, Prisma gives us:
```typescript
// Raw SQL (error-prone):
const incidents = await db.query(
  'SELECT * FROM incidents WHERE ST_DWithin(location, ST_MakePoint($1,$2), $3)',
  [lng, lat, radius]
)

// With Prisma (type-safe, autocomplete):
const incidents = await prisma.incident.findMany({
  where: { status: 'active' },
  orderBy: { createdAt: 'desc' }
})
```
Prisma also handles database migrations automatically when we add new columns.
**Cost:** Free

---

## Technology Decision Matrix

| Requirement | Technology | Why This Over Alternatives |
|---|---|---|
| Frontend framework | Next.js 14 | SSR + Vercel native + full-stack |
| Map library | Leaflet.js | Free, no API key, lightweight |
| Map tiles | OpenStreetMap | 100% free, no limits |
| Traffic data | TomTom API | Best free tier for traffic tiles |
| Real-time updates | Socket.io | Industry standard WebSocket library |
| Backend API | Express.js | Simple, fast, same language as frontend |
| Database | Neon DB (Postgres) | Serverless, free tier, PostGIS support |
| ORM | Prisma | Type-safe, auto-migrations, great DX |
| Auth | NextAuth.js | Next.js native, Google OAuth built-in |
| File storage | Vercel Blob | Native to deployment platform |
| Deployment | Vercel | Zero-config, free tier, Next.js native |
| WebSocket host | Railway.app | Persistent connections, free tier |
| Styling | Tailwind CSS | Fast, responsive, component-friendly |
| Charts | Recharts | Free, React-native, simple API |

---

## Phase-wise Technology Introduction

| Technology | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|---|---|---|---|---|
| Next.js + Leaflet | ✅ | ✅ | ✅ | ✅ |
| Express API | ✅ | ✅ | ✅ | ✅ |
| Neon DB + Prisma | ✅ | ✅ | ✅ | ✅ |
| TomTom Traffic | ✅ | ✅ | ✅ | ✅ |
| Socket.io | ✅ | ✅ | ✅ | ✅ |
| NextAuth.js | ✅ | ✅ | ✅ | ✅ |
| Vercel Blob | ✅ | ✅ | ✅ | ✅ |
| TomTom Routing API | - | ✅ | ✅ | ✅ |
| IMD Weather API | - | - | ✅ | ✅ |
| Web Push | - | - | ✅ | ✅ |
| PWA | - | - | - | ✅ |
| Razorpay | - | - | - | ✅ |

---

## Cost Summary

| Service | Phase 1–2 Cost | Phase 3–4 Cost |
|---|---|---|
| Vercel | Free | Free (or $20/mo Pro) |
| Neon DB | Free | Free (or $19/mo Scale) |
| Vercel Blob | Free (1GB) | $0.023/GB beyond free |
| TomTom API | Free | ~$50/mo at 10K users |
| Railway (WebSocket) | Free ($5 credit) | $5/mo |
| IMD Weather | Free | Free |
| **Total** | **$0** | **~$75/mo at scale** |
