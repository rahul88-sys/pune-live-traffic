# API Design — Pune Live Traffic
> REST API built with Node.js + Express · Deployed on Vercel Serverless Functions

---

## Base URL

```
Development:  http://localhost:3001/api
Production:   https://pune-live-traffic.vercel.app/api
```

---

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Token obtained via NextAuth.js after Google OAuth login.

**Route Protection Levels:**
- 🔓 Public — no auth required
- 🔒 Auth — valid user token required
- 👑 Admin — admin role required
- 🏛️ Authority — PMC/Traffic Police role required

---

## API Modules

```
/api/auth          → Authentication
/api/incidents     → Incident CRUD + voting
/api/routes        → Route planning + saved routes
/api/alerts        → Notification subscriptions
/api/bus           → PMPML bus tracking
/api/areas         → Pune zones + traffic patterns
/api/traffic       → Traffic data + predictions
/api/events        → Planned events (festivals, marathons)
/api/users         → User profile + reputation
/api/authority     → PMC dashboard endpoints
/api/upload        → File upload to Vercel Blob
```

---

## Auth Endpoints

### POST /api/auth/register
🔓 Public — Register with email/password

**Request:**
```json
{
  "email": "ramesh@example.com",
  "password": "securepassword",
  "name": "Ramesh Patil"
}
```

**Response 201:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "ramesh@example.com",
    "name": "Ramesh Patil",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

---

### POST /api/auth/login
🔓 Public — Login with email/password

**Request:**
```json
{
  "email": "ramesh@example.com",
  "password": "securepassword"
}
```

**Response 200:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": { "id": "uuid", "name": "Ramesh Patil", "role": "user" }
}
```

---

## Incident Endpoints

### GET /api/incidents
🔓 Public — Fetch active incidents (main map data)

**Query Parameters:**
```
lat       float    required  User latitude          18.5204
lng       float    required  User longitude         73.8567
radius    int      optional  Search radius in km    default: 10
type      string   optional  Filter by type         waterlogging,accident
severity  string   optional  Filter by severity     high,critical
status    string   optional  default: active
limit     int      optional  default: 50, max: 200
offset    int      optional  for pagination
```

**Response 200:**
```json
{
  "success": true,
  "count": 12,
  "incidents": [
    {
      "id": "uuid",
      "type": "waterlogging",
      "severity": "high",
      "title": "Heavy flooding near FC Road",
      "lat": 18.5204,
      "lng": 73.8567,
      "locationName": "FC Road, Shivajinagar",
      "waterLevel": "knee",
      "upvoteCount": 8,
      "isVerified": true,
      "distanceKm": 0.4,
      "expiresAt": "2024-07-15T10:30:00Z",
      "createdAt": "2024-07-15T08:30:00Z",
      "reporter": {
        "name": "Ramesh P.",
        "reputationScore": 145
      },
      "photos": ["https://blob.vercel.app/photo1.jpg"]
    }
  ]
}
```

---

### POST /api/incidents
🔒 Auth — Create a new incident report

**Request:**
```json
{
  "type": "waterlogging",
  "severity": "high",
  "title": "Road completely flooded",
  "description": "Cars getting stuck, need alternate route",
  "lat": 18.5204,
  "lng": 73.8567,
  "waterLevel": "car_level",
  "photoUrls": ["https://blob.vercel.app/photo1.jpg"]
}
```

**Response 201:**
```json
{
  "success": true,
  "incident": {
    "id": "new_uuid",
    "type": "waterlogging",
    "status": "active",
    "expiresAt": "2024-07-15T10:30:00Z"
  },
  "message": "Incident reported. Thank you for keeping Pune safe!"
}
```

**Side effects:**
- Broadcasts to all connected WebSocket clients in the area
- Sends push notifications to users with nearby saved routes
- Awards +10 reputation points to reporter

---

### GET /api/incidents/:id
🔓 Public — Get single incident details

**Response 200:**
```json
{
  "success": true,
  "incident": {
    "id": "uuid",
    "type": "pothole",
    "severity": "medium",
    "lat": 18.5204,
    "lng": 73.8567,
    "locationName": "Baner Road, near Balewadi",
    "upvoteCount": 3,
    "downvoteCount": 0,
    "isVerified": true,
    "status": "active",
    "photos": [],
    "reporter": { "name": "Priya S.", "reputationScore": 89 },
    "createdAt": "2024-07-15T06:00:00Z",
    "expiresAt": "2024-07-15T08:00:00Z"
  }
}
```

---

### POST /api/incidents/:id/vote
🔒 Auth — Upvote or downvote an incident

**Request:**
```json
{ "voteType": "up" }
```

**Response 200:**
```json
{
  "success": true,
  "upvoteCount": 4,
  "isVerified": true,
  "message": "Vote recorded"
}
```

**Logic:**
- User can vote once per incident
- Changing vote is allowed
- When upvotes reach 3 → `isVerified` becomes true
- Verified incidents shown more prominently on map

---

### PATCH /api/incidents/:id/resolve
🔒 Auth — Mark an incident as resolved (own report or authority)

**Response 200:**
```json
{
  "success": true,
  "message": "Incident marked as resolved"
}
```

---

### DELETE /api/incidents/:id
🔒 Auth — Delete own incident (or admin)

---

## Route Endpoints

### POST /api/routes/plan
🔓 Public — Plan a route from A to B

**Request:**
```json
{
  "originLat": 18.5074,
  "originLng": 73.8077,
  "originName": "Kothrud",
  "destLat": 18.5912,
  "destLng": 73.7389,
  "destName": "Hinjewadi IT Park",
  "travelMode": "car"
}
```

**Response 200:**
```json
{
  "success": true,
  "routes": [
    {
      "id": "route_1",
      "summary": "via Aundh Rd",
      "distanceKm": 14.2,
      "durationMin": 42,
      "trafficDurationMin": 58,
      "trafficSeverity": "heavy",
      "incidentsOnRoute": [
        {
          "type": "waterlogging",
          "severity": "high",
          "locationName": "Aundh Bridge",
          "distanceFromOriginKm": 4.2
        }
      ],
      "geometry": "encoded_polyline_string",
      "warnings": ["Heavy traffic near Hinjewadi entry", "1 waterlogging reported"]
    },
    {
      "id": "route_2",
      "summary": "via NH48",
      "distanceKm": 16.8,
      "durationMin": 48,
      "trafficDurationMin": 52,
      "trafficSeverity": "medium",
      "incidentsOnRoute": [],
      "geometry": "encoded_polyline_string",
      "warnings": []
    }
  ]
}
```

---

### GET /api/routes/saved
🔒 Auth — Get user's saved routes with current traffic status

**Response 200:**
```json
{
  "success": true,
  "routes": [
    {
      "id": "uuid",
      "name": "Home to Office",
      "originName": "Kothrud",
      "destName": "Hinjewadi",
      "currentTraffic": "heavy",
      "estimatedMinutes": 62,
      "activeIncidents": 2,
      "lastChecked": "2024-07-15T08:15:00Z"
    }
  ]
}
```

---

### POST /api/routes/saved
🔒 Auth — Save a new route

**Request:**
```json
{
  "name": "Home to Office",
  "originLat": 18.5074,
  "originLng": 73.8077,
  "originName": "Kothrud",
  "destLat": 18.5912,
  "destLng": 73.7389,
  "destName": "Hinjewadi",
  "usualDepart": "08:30",
  "notifyBefore": 30
}
```

---

### DELETE /api/routes/saved/:id
🔒 Auth — Delete a saved route

---

## Alerts / Notifications

### POST /api/alerts/push-subscribe
🔒 Auth — Register browser for push notifications

**Request:**
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "key_here",
    "auth": "auth_here"
  }
}
```

---

### GET /api/alerts/notifications
🔒 Auth — Get user's notifications

**Query:** `?limit=20&unread_only=true`

**Response 200:**
```json
{
  "success": true,
  "unreadCount": 3,
  "notifications": [
    {
      "id": "uuid",
      "type": "incident_on_route",
      "title": "Waterlogging on your route",
      "body": "Heavy waterlogging reported on Kothrud → Hinjewadi route near Aundh Bridge",
      "isRead": false,
      "createdAt": "2024-07-15T08:10:00Z"
    }
  ]
}
```

---

### PATCH /api/alerts/notifications/:id/read
🔒 Auth — Mark notification as read

---

## Bus Tracking Endpoints

### GET /api/bus/routes
🔓 Public — List all PMPML routes

**Response 200:**
```json
{
  "success": true,
  "routes": [
    {
      "id": "uuid",
      "routeNumber": "11",
      "routeName": "Katraj - Deccan - Shivajinagar",
      "color": "#E53E3E",
      "frequency": 15
    }
  ]
}
```

---

### GET /api/bus/routes/:routeId/live
🔓 Public — Get live bus positions for a route

**Response 200:**
```json
{
  "success": true,
  "routeNumber": "11",
  "buses": [
    {
      "busId": "MH12AB1234",
      "lat": 18.5161,
      "lng": 73.8397,
      "speed": 22.5,
      "heading": 45,
      "nextStop": "Deccan Gymkhana",
      "minutesToNextStop": 4,
      "recordedAt": "2024-07-15T08:28:00Z"
    }
  ]
}
```

---

### GET /api/bus/stops/nearby
🔓 Public — Find bus stops near a location

**Query:** `?lat=18.5204&lng=73.8567&radius=500`

**Response 200:**
```json
{
  "success": true,
  "stops": [
    {
      "id": "uuid",
      "stopName": "Shivajinagar Bus Stand",
      "distanceM": 120,
      "routes": ["11", "105", "HT-1"],
      "nextBus": {
        "routeNumber": "11",
        "minutesAway": 6
      }
    }
  ]
}
```

---

## Traffic & Predictions

### GET /api/traffic/areas
🔓 Public — Get current traffic status for all Pune zones

**Response 200:**
```json
{
  "success": true,
  "areas": [
    {
      "id": "uuid",
      "name": "Hinjewadi IT Park",
      "currentCongestion": "heavy",
      "congestionPct": 82,
      "trend": "worsening",
      "peakHours": { "morning": "08:00-10:00", "evening": "17:30-20:00" }
    }
  ]
}
```

---

### GET /api/traffic/predict/:areaId
🔓 Public — Get traffic prediction for next 6 hours for an area

**Response 200:**
```json
{
  "success": true,
  "areaName": "Hinjewadi IT Park",
  "predictions": [
    { "hour": "09:00", "congestion": "heavy", "congestionPct": 88 },
    { "hour": "10:00", "congestion": "medium", "congestionPct": 65 },
    { "hour": "11:00", "congestion": "low", "congestionPct": 32 },
    { "hour": "12:00", "congestion": "low", "congestionPct": 28 },
    { "hour": "13:00", "congestion": "low", "congestionPct": 35 },
    { "hour": "14:00", "congestion": "medium", "congestionPct": 55 }
  ],
  "bestTimeToTravel": "11:00 - 13:00",
  "confidence": 78
}
```

---

## Events Endpoints

### GET /api/events
🔓 Public — Get upcoming/active events affecting traffic

**Query:** `?active_only=true&lat=18.5204&lng=73.8567`

**Response 200:**
```json
{
  "success": true,
  "events": [
    {
      "id": "uuid",
      "title": "Ganesh Festival Procession",
      "eventType": "festival",
      "description": "Procession from Kasba to Shivajinagar",
      "startsAt": "2024-09-15T16:00:00Z",
      "endsAt": "2024-09-15T23:00:00Z",
      "affectedAreas": ["Kasba", "Shivajinagar", "Deccan"]
    }
  ]
}
```

---

### POST /api/events
👑 Admin / 🏛️ Authority — Create a planned event

---

## Upload Endpoint

### POST /api/upload/incident-photo
🔒 Auth — Upload photo for an incident

**Request:** multipart/form-data with `file` field (JPEG/PNG, max 5MB)

**Response 201:**
```json
{
  "success": true,
  "url": "https://blob.vercel.app/incident-photos/uuid.jpg",
  "thumbnailUrl": "https://blob.vercel.app/incident-photos/uuid_thumb.jpg"
}
```

---

## Authority Dashboard Endpoints

### GET /api/authority/incidents/summary
🏛️ Authority — Dashboard summary for PMC

**Response 200:**
```json
{
  "success": true,
  "summary": {
    "totalActive": 45,
    "byType": {
      "pothole": 18,
      "waterlogging": 12,
      "accident": 4,
      "construction": 11
    },
    "criticalCount": 6,
    "resolvedToday": 8,
    "hotspots": [
      { "area": "Kothrud", "incidentCount": 9 },
      { "area": "Hadapsar", "incidentCount": 7 }
    ]
  }
}
```

---

### GET /api/authority/incidents/export
🏛️ Authority — Export incidents as CSV

**Query:** `?from=2024-07-01&to=2024-07-15&type=pothole`

**Response:** CSV file download

---

### PATCH /api/authority/incidents/:id/status
🏛️ Authority — Update incident status (under_repair / resolved)

---

## WebSocket Events (Socket.io)

**Connection:** `ws://pune-live-traffic-ws.railway.app`

### Client → Server Events

```javascript
// Subscribe to incidents in an area
socket.emit('subscribe:area', { lat: 18.5204, lng: 73.8567, radius: 10 })

// Unsubscribe
socket.emit('unsubscribe:area')
```

### Server → Client Events

```javascript
// New incident reported in subscribed area
socket.on('incident:new', (incident) => { ... })

// Incident was resolved/expired
socket.on('incident:removed', ({ id }) => { ... })

// Incident got enough upvotes — now verified
socket.on('incident:verified', ({ id, upvoteCount }) => { ... })

// Bus location update
socket.on('bus:update', ({ routeId, busId, lat, lng }) => { ... })

// Area traffic status changed
socket.on('traffic:update', ({ areaId, congestion, congestionPct }) => { ... })
```

---

## Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "INCIDENT_NOT_FOUND",
    "message": "The requested incident does not exist or has expired",
    "statusCode": 404
  }
}
```

**Error Codes:**
```
AUTH_REQUIRED          → 401
INVALID_TOKEN          → 401
FORBIDDEN              → 403
INCIDENT_NOT_FOUND     → 404
ROUTE_NOT_FOUND        → 404
VALIDATION_ERROR       → 422
RATE_LIMIT_EXCEEDED    → 429
TOMTOM_API_ERROR       → 502
INTERNAL_ERROR         → 500
```

---

## Rate Limiting

| Endpoint Group | Limit | Window |
|---|---|---|
| GET /api/incidents | 100 req | 1 minute |
| POST /api/incidents | 5 req | 5 minutes |
| POST /api/incidents/:id/vote | 20 req | 1 minute |
| POST /api/routes/plan | 30 req | 1 minute |
| GET /api/bus/* | 60 req | 1 minute |
| POST /api/upload/* | 10 req | 5 minutes |

Rate limit headers returned on every response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1720934400
```
