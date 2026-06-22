# Folder Structure — Pune Live Traffic
> Monorepo: Frontend (Next.js) + Backend (Express) in one repository

---

## Root Structure

```
pune-live-traffic/
│
├── README.md                    ← Project overview
├── PRODUCT_PLAN.md              ← Full product roadmap (phases)
├── TECH_STACK.md                ← Technology decisions + reasons
├── DATABASE_SCHEMA.md           ← All DB tables + relationships
├── API_DESIGN.md                ← All API endpoints + request/response
├── FOLDER_STRUCTURE.md          ← This file
│
├── .env.local                   ← Local environment variables (never commit)
├── .env.example                 ← Template showing required env vars
├── .gitignore
├── package.json                 ← Root package (monorepo scripts)
│
├── frontend/                    ← Next.js 14 App
└── backend/                     ← Node.js + Express API
```

---

## Frontend Structure (Next.js 14 App Router)

```
frontend/
│
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── public/
│   ├── icons/                   ← PWA icons (192x192, 512x512)
│   ├── manifest.json            ← PWA manifest
│   └── sw.js                    ← Service worker for offline support
│
└── src/
    │
    ├── app/                     ← Next.js App Router pages
    │   ├── layout.tsx           ← Root layout (header, auth provider)
    │   ├── page.tsx             ← Home page → redirects to /map
    │   ├── globals.css
    │   │
    │   ├── map/                 ← Main map page
    │   │   └── page.tsx         ← Full-screen traffic map
    │   │
    │   ├── routes/              ← Route planning
    │   │   ├── page.tsx         ← Plan a route A → B
    │   │   └── saved/
    │   │       └── page.tsx     ← Saved routes dashboard
    │   │
    │   ├── bus/                 ← PMPML bus tracker
    │   │   ├── page.tsx         ← Bus routes list
    │   │   └── [routeId]/
    │   │       └── page.tsx     ← Live tracker for specific route
    │   │
    │   ├── alerts/              ← Notifications & subscriptions
    │   │   └── page.tsx
    │   │
    │   ├── profile/             ← User profile + reputation
    │   │   └── page.tsx
    │   │
    │   ├── authority/           ← PMC / Traffic Police dashboard
    │   │   ├── layout.tsx       ← Auth guard (authority role only)
    │   │   ├── page.tsx         ← Summary dashboard
    │   │   ├── incidents/
    │   │   │   └── page.tsx     ← All incidents table
    │   │   └── heatmap/
    │   │       └── page.tsx     ← Problem area heatmap
    │   │
    │   ├── auth/
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   │
    │   └── api/                 ← Next.js API routes (auth only)
    │       └── auth/
    │           └── [...nextauth]/route.ts
    │
    ├── components/
    │   │
    │   ├── map/                 ← All map-related components
    │   │   ├── MapContainer.tsx         ← Main Leaflet map wrapper
    │   │   ├── TrafficLayer.tsx         ← TomTom traffic tile layer
    │   │   ├── IncidentMarker.tsx       ← Single incident pin on map
    │   │   ├── IncidentCluster.tsx      ← Grouped incident pins
    │   │   ├── WaterloggingOverlay.tsx  ← Blue flood overlay
    │   │   ├── BusMarker.tsx            ← Moving bus icon on map
    │   │   ├── RoutePolyline.tsx        ← Drawn route on map
    │   │   ├── UserLocationDot.tsx      ← Blue dot for user position
    │   │   ├── ZoneLabel.tsx            ← Area name labels
    │   │   └── MapControls.tsx          ← Zoom, locate, layers toggle
    │   │
    │   ├── incidents/
    │   │   ├── IncidentFeed.tsx         ← Right sidebar incident list
    │   │   ├── IncidentCard.tsx         ← Single incident in feed
    │   │   ├── IncidentReportForm.tsx   ← Report new incident modal
    │   │   ├── IncidentDetail.tsx       ← Full incident detail panel
    │   │   ├── IncidentTypeIcon.tsx     ← Icon per incident type
    │   │   ├── VoteButton.tsx           ← Upvote/downvote buttons
    │   │   └── PhotoUpload.tsx          ← Photo upload for incident
    │   │
    │   ├── routes/
    │   │   ├── RoutePlanner.tsx         ← Origin + Destination inputs
    │   │   ├── RouteOption.tsx          ← Single route choice card
    │   │   ├── RouteIncidentWarning.tsx ← Incident warning on route
    │   │   └── SavedRouteCard.tsx       ← Saved route with traffic status
    │   │
    │   ├── bus/
    │   │   ├── RouteSelector.tsx        ← Dropdown to pick bus route
    │   │   ├── BusCard.tsx              ← Bus info card
    │   │   └── NearbyStops.tsx          ← Stops near user location
    │   │
    │   ├── traffic/
    │   │   ├── AreaTrafficCard.tsx      ← Traffic status per zone
    │   │   ├── TrafficPrediction.tsx    ← 6-hour forecast chart
    │   │   └── CongestionBadge.tsx      ← Color-coded congestion label
    │   │
    │   ├── notifications/
    │   │   ├── NotificationBell.tsx     ← Bell icon with unread count
    │   │   ├── NotificationPanel.tsx    ← Dropdown notification list
    │   │   └── NotificationItem.tsx     ← Single notification
    │   │
    │   └── ui/                  ← Reusable UI primitives
    │       ├── Button.tsx
    │       ├── Modal.tsx
    │       ├── Drawer.tsx        ← Mobile slide-up panel
    │       ├── Badge.tsx
    │       ├── Spinner.tsx
    │       ├── SearchInput.tsx
    │       ├── Avatar.tsx
    │       └── Toast.tsx         ← Notification toasts
    │
    ├── hooks/                   ← Custom React hooks
    │   ├── useMap.ts            ← Map state, center, zoom
    │   ├── useIncidents.ts      ← Fetch + real-time incident updates
    │   ├── useUserLocation.ts   ← Browser geolocation
    │   ├── useSocket.ts         ← Socket.io connection
    │   ├── useTraffic.ts        ← Traffic area data
    │   ├── useBus.ts            ← Bus tracking
    │   └── useNotifications.ts  ← Push notification setup
    │
    ├── lib/                     ← Utilities and configs
    │   ├── api.ts               ← Axios instance with auth headers
    │   ├── socket.ts            ← Socket.io client setup
    │   ├── auth.ts              ← NextAuth config
    │   ├── tomtom.ts            ← TomTom API helpers
    │   ├── nominatim.ts         ← OpenStreetMap geocoding
    │   └── pushNotification.ts  ← Web Push subscription helper
    │
    ├── store/                   ← Global state (Zustand)
    │   ├── mapStore.ts          ← Map viewport, selected incident
    │   ├── incidentStore.ts     ← Incidents list + filter state
    │   └── userStore.ts         ← Logged-in user data
    │
    └── types/                   ← TypeScript interfaces
        ├── incident.ts
        ├── route.ts
        ├── bus.ts
        ├── user.ts
        └── traffic.ts
```

---

## Backend Structure (Node.js + Express)

```
backend/
│
├── package.json
├── tsconfig.json
├── .env                         ← Backend environment variables
│
├── prisma/
│   ├── schema.prisma            ← Database schema
│   ├── migrations/              ← Auto-generated migration files
│   └── seed.ts                  ← Seed Pune areas + initial data
│
└── src/
    │
    ├── index.ts                 ← Express app entry point
    ├── server.ts                ← HTTP server + Socket.io setup
    │
    ├── routes/                  ← Express route definitions
    │   ├── auth.routes.ts
    │   ├── incidents.routes.ts
    │   ├── routes.routes.ts
    │   ├── alerts.routes.ts
    │   ├── bus.routes.ts
    │   ├── areas.routes.ts
    │   ├── traffic.routes.ts
    │   ├── events.routes.ts
    │   ├── users.routes.ts
    │   ├── authority.routes.ts
    │   └── upload.routes.ts
    │
    ├── controllers/             ← Business logic per route
    │   ├── auth.controller.ts
    │   ├── incidents.controller.ts
    │   ├── routes.controller.ts
    │   ├── bus.controller.ts
    │   ├── traffic.controller.ts
    │   ├── events.controller.ts
    │   ├── users.controller.ts
    │   ├── authority.controller.ts
    │   └── upload.controller.ts
    │
    ├── middleware/              ← Express middleware
    │   ├── auth.middleware.ts   ← JWT verification
    │   ├── role.middleware.ts   ← Role-based access control
    │   ├── rateLimit.middleware.ts
    │   ├── validate.middleware.ts ← Request body validation
    │   └── errorHandler.ts     ← Global error handler
    │
    ├── services/               ← External API + complex logic
    │   ├── tomtom.service.ts   ← TomTom API calls
    │   ├── nominatim.service.ts ← Reverse geocoding
    │   ├── pushNotification.service.ts ← Web Push sending
    │   ├── socket.service.ts   ← WebSocket broadcast logic
    │   ├── prediction.service.ts ← Traffic prediction algorithm
    │   └── blob.service.ts     ← Vercel Blob upload/delete
    │
    ├── jobs/                   ← Scheduled background jobs
    │   ├── expireIncidents.job.ts   ← Auto-expire old incidents
    │   ├── fetchTrafficSnapshot.job.ts ← Snapshot traffic every 30min
    │   ├── cleanupBusLocations.job.ts  ← Delete old bus location data
    │   └── sendMorningSummary.job.ts   ← Daily route summary push
    │
    ├── validators/             ← Zod validation schemas
    │   ├── incident.validator.ts
    │   ├── route.validator.ts
    │   └── user.validator.ts
    │
    └── lib/
        ├── prisma.ts           ← Prisma client singleton
        ├── jwt.ts              ← JWT sign/verify helpers
        └── constants.ts        ← App constants (incident types, etc.)
```

---

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"

# Auth
NEXTAUTH_SECRET="your_secret_here"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
JWT_SECRET="your_jwt_secret"

# TomTom API
TOMTOM_API_KEY="your_tomtom_key"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"

# Web Push Notifications
VAPID_PUBLIC_KEY="your_vapid_public_key"
VAPID_PRIVATE_KEY="your_vapid_private_key"
VAPID_EMAIL="mailto:admin@pune-traffic.com"

# App
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
NEXT_PUBLIC_TOMTOM_API_KEY="your_tomtom_key"
PORT=3001
```

---

## Development Scripts

```json
// Root package.json scripts
{
  "scripts": {
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "build": "cd frontend && npm run build",
    "db:migrate": "cd backend && npx prisma migrate dev",
    "db:seed": "cd backend && npx prisma db seed",
    "db:studio": "cd backend && npx prisma studio"
  }
}
```

---

## Git Branching Strategy

```
main              ← Production (auto-deploys to Vercel)
  └── develop     ← Integration branch
        ├── feature/map-incident-reporting
        ├── feature/route-planner
        ├── feature/bus-tracker
        ├── feature/waterlogging-alerts
        └── fix/incident-vote-bug
```

---

## Deployment Architecture

```
GitHub Push → main
      │
      ▼
  Vercel CI/CD
      │
      ├── Builds Next.js frontend
      ├── Deploys Express API as Vercel Serverless Functions
      └── Sets environment variables from Vercel Dashboard
            │
            ├── Connects to → Neon DB (PostgreSQL)
            ├── Connects to → Vercel Blob (file storage)
            └── Connects to → TomTom API, Google OAuth

Railway (separate)
  └── Deploys Socket.io WebSocket server (persistent)
        └── Connects to → Neon DB (same database)
```
