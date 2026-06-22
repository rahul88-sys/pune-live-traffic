# Database Schema — Pune Live Traffic
> PostgreSQL on Neon DB · ORM: Prisma · Extension: PostGIS

---

## Entity Relationship Overview

```
users
  │
  ├──< incidents (user reports incidents)
  │       │
  │       ├──< incident_votes (users upvote/downvote incidents)
  │       ├──< incident_photos (blob URLs for photos)
  │       └──< incident_comments (optional user comments)
  │
  ├──< saved_routes (user saves routes)
  │
  ├──< route_alerts (user subscribes to route alerts)
  │
  └──< notifications (user receives notifications)

events (admin-added planned events like Ganesh festival)

bus_routes (PMPML route data)
  └──< bus_stops (stops on each route)
      └──< bus_locations (real-time bus positions)

traffic_snapshots (historical traffic data for predictions)

areas (Pune zones/areas metadata)
```

---

## Tables

### users
```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  name            VARCHAR(100) NOT NULL,
  avatar_url      TEXT,
  provider        VARCHAR(20) NOT NULL,     -- 'google' | 'email'
  provider_id     VARCHAR(255),             -- Google sub ID
  role            VARCHAR(20) DEFAULT 'user', -- 'user' | 'authority' | 'admin'
  authority_type  VARCHAR(50),              -- 'pmc' | 'traffic_police' | NULL
  reputation_score INTEGER DEFAULT 0,
  total_reports   INTEGER DEFAULT 0,
  accurate_reports INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Field notes:**
- `role` — controls what dashboard user sees (authority gets PMC dashboard)
- `reputation_score` — increases when reports are upvoted/verified, decreases when marked spam
- `accurate_reports` — count of reports later confirmed by others (for accuracy %)

---

### incidents
```sql
CREATE TABLE incidents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  type            VARCHAR(50) NOT NULL,
  -- Types: 'traffic_jam' | 'road_block' | 'waterlogging' | 'pothole' |
  --        'accident' | 'procession' | 'construction' | 'other'

  severity        VARCHAR(20) DEFAULT 'medium',
  -- Severity: 'low' | 'medium' | 'high' | 'critical'

  title           VARCHAR(200),             -- optional short title
  description     TEXT,                     -- optional details
  lat             DECIMAL(10, 8) NOT NULL,  -- latitude
  lng             DECIMAL(11, 8) NOT NULL,  -- longitude
  location_name   VARCHAR(200),             -- reverse geocoded address
  area_id         UUID REFERENCES areas(id),

  -- For waterlogging specifically
  water_level     VARCHAR(20),
  -- 'ankle' | 'knee' | 'car_level' | 'impassable'

  upvote_count    INTEGER DEFAULT 0,
  downvote_count  INTEGER DEFAULT 0,
  is_verified     BOOLEAN DEFAULT false,    -- true when upvotes >= 3
  is_resolved     BOOLEAN DEFAULT false,
  status          VARCHAR(20) DEFAULT 'active',
  -- 'active' | 'expired' | 'resolved' | 'spam'

  source          VARCHAR(20) DEFAULT 'user',
  -- 'user' | 'tomtom' | 'authority' | 'scraper'

  expires_at      TIMESTAMP WITH TIME ZONE, -- auto-set to created_at + 2 hours
  resolved_at     TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PostGIS geographic index for fast nearby queries
CREATE INDEX idx_incidents_location
  ON incidents USING GIST (ST_MakePoint(lng, lat));

-- Index for active incidents (most common query)
CREATE INDEX idx_incidents_status_created
  ON incidents (status, created_at DESC);

-- Index for type filtering
CREATE INDEX idx_incidents_type
  ON incidents (type, status);
```

**Key query example:**
```sql
-- Find all active incidents within 5km of user
SELECT * FROM incidents
WHERE status = 'active'
  AND ST_DWithin(
    ST_MakePoint(lng, lat)::geography,
    ST_MakePoint(73.8567, 18.5204)::geography,  -- Pune center
    5000  -- 5km in meters
  )
ORDER BY created_at DESC;
```

---

### incident_votes
```sql
CREATE TABLE incident_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type   VARCHAR(10) NOT NULL,  -- 'up' | 'down'
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(incident_id, user_id)  -- one vote per user per incident
);
```

---

### incident_photos
```sql
CREATE TABLE incident_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  blob_url    TEXT NOT NULL,           -- Vercel Blob URL
  thumbnail_url TEXT,                  -- smaller version
  uploaded_by UUID REFERENCES users(id),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### saved_routes
```sql
CREATE TABLE saved_routes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,  -- e.g., "Home to Office"
  origin_lat    DECIMAL(10, 8) NOT NULL,
  origin_lng    DECIMAL(11, 8) NOT NULL,
  origin_name   VARCHAR(200),
  dest_lat      DECIMAL(10, 8) NOT NULL,
  dest_lng      DECIMAL(11, 8) NOT NULL,
  dest_name     VARCHAR(200),
  usual_depart  TIME,                   -- typical departure time e.g., 08:30
  notify_before INTEGER DEFAULT 30,     -- notify X minutes before usual departure
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### route_alerts
```sql
CREATE TABLE route_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  saved_route_id  UUID REFERENCES saved_routes(id) ON DELETE CASCADE,
  alert_types     TEXT[],
  -- e.g. ['accident', 'waterlogging', 'road_block']
  notify_via      TEXT[],
  -- e.g. ['push', 'email'] (sms in future)
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### notifications
```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL,
  -- 'incident_on_route' | 'route_clear' | 'morning_summary' | 'event_alert'
  title       VARCHAR(200) NOT NULL,
  body        TEXT NOT NULL,
  data        JSONB,                    -- extra data (incident_id, route_id, etc.)
  is_read     BOOLEAN DEFAULT false,
  sent_via    TEXT[],                   -- ['push', 'email']
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread
  ON notifications (user_id, is_read, created_at DESC);
```

---

### push_subscriptions
```sql
CREATE TABLE push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL,
  p256dh_key  TEXT NOT NULL,
  auth_key    TEXT NOT NULL,
  device_info JSONB,                    -- browser/OS info
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, endpoint)
);
```

---

### events (Planned Road Events)
```sql
CREATE TABLE events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by    UUID REFERENCES users(id),  -- admin or authority user
  title         VARCHAR(200) NOT NULL,      -- "Ganesh Festival Procession"
  description   TEXT,
  event_type    VARCHAR(50) NOT NULL,
  -- 'festival' | 'marathon' | 'vip_visit' | 'sports' | 'construction'

  affected_area JSONB,
  -- GeoJSON polygon or list of road segments affected

  starts_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at       TIMESTAMP WITH TIME ZONE NOT NULL,
  is_approved   BOOLEAN DEFAULT false,     -- authority must approve before showing
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### areas (Pune Zones)
```sql
CREATE TABLE areas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,    -- "Hinjewadi", "Kharadi", "Deccan"
  zone_type   VARCHAR(50),
  -- 'it_park' | 'residential' | 'commercial' | 'educational' | 'transit_hub'
  center_lat  DECIMAL(10, 8),
  center_lng  DECIMAL(11, 8),
  boundary    JSONB,                    -- GeoJSON polygon
  typical_peak_hours JSONB,
  -- { morning: "8:00-10:00", evening: "17:00-20:00" }
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### traffic_snapshots (For Predictions)
```sql
CREATE TABLE traffic_snapshots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id       UUID REFERENCES areas(id),
  congestion    VARCHAR(20) NOT NULL,   -- 'free' | 'slow' | 'heavy' | 'standstill'
  congestion_pct INTEGER,              -- 0-100 congestion percentage
  snapshot_at   TIMESTAMP WITH TIME ZONE NOT NULL,
  day_of_week   SMALLINT,             -- 0=Sunday, 1=Monday ... 6=Saturday
  hour_of_day   SMALLINT,             -- 0-23
  is_holiday    BOOLEAN DEFAULT false,
  weather       VARCHAR(20),          -- 'clear' | 'rain' | 'heavy_rain'
  source        VARCHAR(20)           -- 'tomtom' | 'calculated'
);

-- Partition by month for performance (large table over time)
CREATE INDEX idx_traffic_snapshots_area_time
  ON traffic_snapshots (area_id, snapshot_at DESC);

CREATE INDEX idx_traffic_snapshots_prediction
  ON traffic_snapshots (area_id, day_of_week, hour_of_day);
```

---

### bus_routes
```sql
CREATE TABLE bus_routes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_number VARCHAR(20) NOT NULL,   -- "11", "105", "HT-1"
  route_name  VARCHAR(200),
  operator    VARCHAR(50) DEFAULT 'PMPML',
  color       VARCHAR(10),             -- hex color for map display
  frequency   INTEGER,                 -- minutes between buses
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### bus_stops
```sql
CREATE TABLE bus_stops (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id    UUID REFERENCES bus_routes(id),
  stop_name   VARCHAR(200) NOT NULL,
  stop_number SMALLINT,               -- sequence on route
  lat         DECIMAL(10, 8) NOT NULL,
  lng         DECIMAL(11, 8) NOT NULL,
  is_terminal BOOLEAN DEFAULT false,  -- first or last stop
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bus_stops_location
  ON bus_stops USING GIST (ST_MakePoint(lng, lat));
```

---

### bus_locations (Real-time)
```sql
CREATE TABLE bus_locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id    UUID REFERENCES bus_routes(id),
  bus_id      VARCHAR(50),            -- bus registration number
  lat         DECIMAL(10, 8) NOT NULL,
  lng         DECIMAL(11, 8) NOT NULL,
  speed       DECIMAL(5, 2),          -- km/h
  heading     DECIMAL(5, 2),          -- degrees 0-360
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Only keep last 1 hour of location data (cleanup job)
CREATE INDEX idx_bus_locations_route_time
  ON bus_locations (route_id, recorded_at DESC);
```

---

## Prisma Schema (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String   @id @default(uuid())
  email           String   @unique
  name            String
  avatarUrl       String?
  provider        String
  providerId      String?
  role            String   @default("user")
  authorityType   String?
  reputationScore Int      @default(0)
  totalReports    Int      @default(0)
  accurateReports Int      @default(0)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  incidents       Incident[]
  votes           IncidentVote[]
  savedRoutes     SavedRoute[]
  notifications   Notification[]
  pushSubs        PushSubscription[]
}

model Incident {
  id           String   @id @default(uuid())
  userId       String?
  type         String
  severity     String   @default("medium")
  title        String?
  description  String?
  lat          Decimal  @db.Decimal(10, 8)
  lng          Decimal  @db.Decimal(11, 8)
  locationName String?
  waterLevel   String?
  upvoteCount  Int      @default(0)
  downvoteCount Int     @default(0)
  isVerified   Boolean  @default(false)
  isResolved   Boolean  @default(false)
  status       String   @default("active")
  source       String   @default("user")
  expiresAt    DateTime?
  resolvedAt   DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user         User?          @relation(fields: [userId], references: [id])
  votes        IncidentVote[]
  photos       IncidentPhoto[]
}
```

---

## Data Retention Policy

| Table | Retention | Reason |
|---|---|---|
| incidents (active) | 2 hours auto-expire | Stale incidents mislead users |
| incidents (resolved/expired) | 90 days | For analysis and patterns |
| traffic_snapshots | 1 year | For prediction model training |
| bus_locations | 1 hour | Real-time only, no history needed |
| notifications | 30 days | User can review recent alerts |
| incident_photos | 90 days | Blob storage cost management |

---

## Initial Seed Data (Pune Zones)

```sql
INSERT INTO areas (name, zone_type, center_lat, center_lng, typical_peak_hours) VALUES
('Hinjewadi IT Park', 'it_park', 18.5912, 73.7389, '{"morning":"08:00-10:00","evening":"17:30-20:00"}'),
('Kharadi IT Park', 'it_park', 18.5515, 73.9354, '{"morning":"08:30-10:30","evening":"18:00-20:30"}'),
('Magarpatta', 'it_park', 18.5089, 73.9260, '{"morning":"08:30-10:00","evening":"18:00-19:30"}'),
('Shivajinagar', 'commercial', 18.5308, 73.8474, '{"morning":"09:00-11:00","evening":"17:00-20:00"}'),
('Deccan Gymkhana', 'commercial', 18.5161, 73.8397, '{"morning":"09:00-10:30","evening":"17:00-19:30"}'),
('Pune Station', 'transit_hub', 18.5284, 73.8742, '{"morning":"07:00-10:00","evening":"17:00-21:00"}'),
('Aundh', 'residential', 18.5590, 73.8076, '{"morning":"08:00-09:30","evening":"17:30-19:30"}'),
('Kothrud', 'residential', 18.5074, 73.8077, '{"morning":"08:00-09:30","evening":"17:30-19:30"}'),
('Wakad', 'residential', 18.5988, 73.7615, '{"morning":"08:00-09:30","evening":"18:00-20:00"}'),
('Hadapsar', 'commercial', 18.5089, 73.9260, '{"morning":"08:30-10:00","evening":"17:30-19:30"}');
```
