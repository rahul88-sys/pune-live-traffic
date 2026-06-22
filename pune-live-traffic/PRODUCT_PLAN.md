# Product Plan — Pune Live Traffic
> Product Owner View: Full roadmap, features, user stories, acceptance criteria

---

## Product Vision

"Be the go-to traffic intelligence platform for every Pune commuter — more
accurate than Google Maps for Pune-specific conditions, free to use, and
powered by the community."

---

## Success Metrics (KPIs)

| Metric | Phase 1 Target | Phase 4 Target |
|---|---|---|
| Daily Active Users | 500 | 50,000 |
| Incidents reported/day | 20 | 500 |
| Map loads/day | 1,000 | 100,000 |
| User retention (7-day) | 30% | 60% |
| Report accuracy (verified) | - | 80% |

---

## User Personas

### Persona 1 — Ramesh (Daily IT Commuter)
- Age: 28, Software Engineer at Hinjewadi
- Commutes: Kothrud → Hinjewadi (45min to 2hrs depending on traffic)
- Pain: Never knows if he should leave early or take alternate route
- Needs: Real-time Hinjewadi entry traffic + alternate route suggestion

### Persona 2 — Sunita (Homemaker / School Parent)
- Age: 38, drops kids to school in Aundh
- Pain: Doesn't know which roads are waterlogged during monsoon
- Needs: Safe route to school, waterlogging alerts

### Persona 3 — Vijay (PMPML Bus User)
- Age: 22, College student, uses bus Route 11
- Pain: Buses have no tracking, he waits 30 min at stop not knowing
- Needs: Real-time bus location at his stop

### Persona 4 — Priya (Delivery Worker)
- Age: 26, Swiggy delivery partner
- Pain: Gets stuck in unknown jams, loses time and money
- Needs: Fastest route with real incident data

### Persona 5 — PMC Official (Municipal Authority)
- Age: 45, Pune Municipal Corporation road department
- Pain: Doesn't know where potholes/flooding are reported until complaints pile up
- Needs: Dashboard showing all citizen-reported road issues

---

## Phase 1 — Foundation (Weeks 1–4)
**Goal:** Working map with live traffic + incident reporting

### Features

#### F1.1 — Interactive Map with Traffic Layer
**User Story:** As a commuter, I want to see real-time traffic on Pune roads
so that I can decide my route before leaving.

**Acceptance Criteria:**
- Map loads centered on Pune city by default
- Roads colored Green (free flow) / Yellow (slow) / Red (heavy jam)
- Traffic data refreshes every 60 seconds automatically
- User can zoom in to street level
- Works on mobile browser (responsive)

**Data Source:** TomTom Traffic API (free tier: 2,500 req/day)
**Tech:** Leaflet.js + OpenStreetMap + TomTom Traffic Tile Layer

---

#### F1.2 — Incident Reporting (Core Feature)
**User Story:** As a citizen, I want to report a traffic incident on the map
so that other commuters are warned in real time.

**Incident Types:**
- 🚗 Traffic Jam
- 🚧 Road Block / Diversion
- 💧 Waterlogging
- 🕳️ Pothole
- 🚨 Accident
- 🎉 Procession / Event
- 🏗️ Road Construction
- ⚠️ Other

**Acceptance Criteria:**
- User taps on map location → selects incident type → adds optional note + photo
- Incident appears on map for ALL users within 5 seconds (WebSocket)
- Incident auto-expires after 2 hours (unless re-confirmed by others)
- User can upvote/confirm an existing incident (increases reliability)
- Minimum 3 upvotes to show incident as "verified"
- Photo upload supported (Vercel Blob storage)
- No login required to view; login required to report

---

#### F1.3 — User Authentication
**User Story:** As a user, I want to sign in so my reports are tied to my account
and I can build a reputation score.

**Acceptance Criteria:**
- Google OAuth login (one click, no password)
- Email/password login as fallback
- User profile: name, photo, reports submitted, accuracy score
- JWT token-based session (NextAuth.js)

---

#### F1.4 — Incident Feed (Sidebar)
**User Story:** As a commuter, I want to see a list of recent incidents
so I can quickly scan without looking at the map.

**Acceptance Criteria:**
- Right sidebar shows last 20 incidents, sorted by newest
- Each entry: icon + type + location name + time ago + upvote count
- Click incident → map flies to that location
- Filter by incident type
- Auto-updates in real time

---

#### F1.5 — Basic Search
**User Story:** As a user, I want to search for a location in Pune
so the map navigates there.

**Acceptance Criteria:**
- Search bar at top of map
- Autocomplete suggests Pune locations (areas, landmarks, IT parks)
- On select, map centers to that location
- Uses Nominatim (OpenStreetMap geocoding — free)

---

### Phase 1 Deliverables
- [ ] Next.js app deployed on Vercel
- [ ] Express API deployed on Vercel (serverless functions)
- [ ] Neon DB with Users + Incidents tables
- [ ] Leaflet map with TomTom traffic layer
- [ ] Incident reporting form with photo upload
- [ ] Real-time incident feed via WebSocket
- [ ] Google OAuth login

**Timeline:** 4 weeks
**Risk:** TomTom free tier limit (2,500 req/day) — mitigate by caching tiles

---

## Phase 2 — Transit Intelligence (Weeks 5–8)
**Goal:** PMPML bus tracking + route planning

### Features

#### F2.1 — PMPML Bus Live Tracker
**User Story:** As a bus commuter, I want to see where my bus is right now
so I know how long to wait at the stop.

**Acceptance Criteria:**
- Map shows live bus icons for all active PMPML routes
- Click bus icon → shows route number, next stops, estimated arrival
- Search by route number → highlights that route on map
- Shows nearest bus stop to user's current location
- Data refreshes every 30 seconds

**Data Source:** PMPML Open Data / Scraping PMPML website (public data)
**Note:** If official API unavailable, use community-contributed timetable data

---

#### F2.2 — Route Planner (A to B)
**User Story:** As a commuter, I want to plan a route from my home to office
considering current traffic and incidents.

**Acceptance Criteria:**
- Enter source + destination in Pune
- App shows 3 route options with estimated time
- Each route shows: distance, time, traffic severity, active incidents on route
- Incidents on route shown as warnings ("2 potholes, 1 waterlogging on this route")
- Option to get bus route suggestion for same journey
- Share route as link

**Tech:** TomTom Routing API (free tier available)

---

#### F2.3 — Saved Routes
**User Story:** As a daily commuter, I want to save my regular routes
so I can check traffic on them with one tap.

**Acceptance Criteria:**
- Save up to 5 routes (free tier)
- Home screen shows all saved routes with current traffic status
- Color coded: Green / Yellow / Red per saved route
- Last checked timestamp shown

---

#### F2.4 — Pune Zones & Landmarks Map
**User Story:** As a new resident, I want to understand Pune's major zones
so I can navigate the city better.

**Acceptance Criteria:**
- Map has labeled zones: Hinjewadi, Kharadi, Shivajinagar, Deccan, Aundh, etc.
- Major landmarks pinned: Pune Station, Airport, FC Road, MG Road, etc.
- IT Parks marked as special zones with typical rush hour info
- Clickable landmark → shows typical traffic pattern by hour

---

### Phase 2 Deliverables
- [ ] PMPML bus tracker on map
- [ ] Route planner with incident overlay
- [ ] Saved routes feature
- [ ] Pune zones and landmarks layer

**Timeline:** 4 weeks (Weeks 5–8)

---

## Phase 3 — Intelligence & Alerts (Weeks 9–12)
**Goal:** Predictions, notifications, authority tools

### Features

#### F3.1 — Monsoon Waterlogging Alert System
**User Story:** As a Pune resident during monsoon, I want real-time waterlogging
alerts so I don't drive into a flooded road.

**Acceptance Criteria:**
- Special waterlogging incident type with severity level (ankle/knee/car-level)
- Waterlogged locations shown with blue overlay on map
- High-severity waterlogging triggers push notification to nearby users
- Historical waterlogging map (which spots flood every year)
- "Monsoon Mode" toggle that highlights all known flood-prone roads
- IMD weather API integration for rain forecast

**This feature is unique to Pune and extremely high value during June–September**

---

#### F3.2 — Traffic Pattern Predictions
**User Story:** As a commuter, I want to know if traffic will be bad at 6pm today
so I can plan to leave early or late.

**Acceptance Criteria:**
- "Traffic Forecast" tab shows hourly prediction for next 6 hours
- Based on: historical data from our DB + day of week + holidays + events
- Hinjewadi, Kharadi, Deccan, Station area shown separately
- "Best time to travel" recommendation shown
- Accuracy shown to users (builds trust)

**Tech:** Historical data aggregation from our Neon DB + simple time-series logic

---

#### F3.3 — Push Notifications & Alerts
**User Story:** As a user, I want to receive alerts for my saved routes
so I know before I leave if there's a problem.

**Acceptance Criteria:**
- Subscribe to alerts for specific routes or areas
- Notification when: new major incident on saved route, waterlogging on usual route
- Daily morning summary: "Your Kothrud→Hinjewadi route has moderate traffic. Leave by 8:30am"
- Web push notifications (no app needed)
- SMS fallback option (Twilio free tier)

---

#### F3.4 — Event & Festival Traffic Alerts
**User Story:** As a commuter, I want to know about processions and events
that will block roads so I can avoid those areas.

**Acceptance Criteria:**
- Admin can add scheduled events (Ganesh festival routes, marathons, VIP visits)
- Event shown on map as blocked road segments for specific time window
- Users notified 1 day before + 2 hours before event if it affects their saved route
- Community can also report ongoing events

---

#### F3.5 — Authority / PMC Dashboard
**User Story:** As a PMC official, I want to see all citizen-reported road issues
in a dashboard so I can prioritize repairs.

**Acceptance Criteria:**
- Separate login for verified authorities (PMC, Traffic Police)
- Dashboard shows: all potholes reported (last 30 days), waterlogging hotspots, accident zones
- Export data as CSV / PDF report
- Mark issues as "Under Repair" or "Resolved" — reflects on public map
- Heatmap of most problematic areas in Pune

---

### Phase 3 Deliverables
- [ ] Waterlogging alert system with severity levels
- [ ] Traffic predictions based on historical data
- [ ] Web push notifications
- [ ] Event/festival road block calendar
- [ ] PMC authority dashboard

**Timeline:** 4 weeks (Weeks 9–12)

---

## Phase 4 — Scale & Monetization (Weeks 13–16)
**Goal:** Mobile app, growth, revenue

### Features

#### F4.1 — Progressive Web App (PWA)
**User Story:** As a mobile user, I want to install this on my phone
like a native app without going to the app store.

**Acceptance Criteria:**
- "Install App" prompt on mobile browsers
- Works offline for last-loaded map (cached tiles)
- Push notifications work on mobile
- App icon on home screen
- Fast loading (< 3 seconds on 4G)

---

#### F4.2 — Gamification & Reputation System
**User Story:** As an active reporter, I want to earn points and badges
so I feel motivated to keep contributing accurate reports.

**Acceptance Criteria:**
- Points for: reporting incident (+10), getting upvotes (+5), accuracy bonus (+20)
- Badges: "Monsoon Hero" (10 waterlogging reports), "Pothole Spotter" (20 potholes), etc.
- Weekly leaderboard for top reporters in Pune
- High-reputation users' reports shown with "Verified Reporter" badge
- Points redeemable for (future): local brand coupons

---

#### F4.3 — API for Third Parties
**User Story:** As a logistics company or developer, I want access to Pune
traffic incident data via API so I can integrate it into my system.

**Acceptance Criteria:**
- Public REST API with API key authentication
- Endpoints: GET incidents, GET traffic status by area, GET waterlogging alerts
- Free tier: 1,000 requests/day
- Paid tier: unlimited requests + historical data
- API documentation page

---

#### F4.4 — Monetization Features
**Revenue Streams:**

1. **B2B API Access** — Charge logistics companies, fleet operators for traffic data
2. **Premium User Plan** — ₹99/month: unlimited saved routes, SMS alerts, ad-free
3. **Authority Subscriptions** — PMC, Traffic Police pay for dashboard access + data exports
4. **Local Business Ads** — "Petrol pump near Hinjewadi" shown contextually on map
5. **Sponsored Alerts** — "Road closed near Phoenix Mall — mall is open, take alternate route"

---

### Phase 4 Deliverables
- [ ] PWA with offline support
- [ ] Gamification + reputation system
- [ ] Third-party API with documentation
- [ ] Payment integration (Razorpay) for premium plans
- [ ] Admin panel for managing users, reports, authorities

**Timeline:** 4 weeks (Weeks 13–16)

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| TomTom API free tier exhausted | High | High | Cache traffic tiles, upgrade plan when users grow |
| PMPML data unavailable | Medium | Medium | Use community timetable data initially |
| Low user adoption initially | High | High | Partner with Pune IT companies for employee use |
| Fake/spam incident reports | Medium | High | Require login to report, upvote verification system |
| Vercel serverless cold starts | Low | Medium | Keep functions warm with ping service |
| Neon DB connection limits | Low | Medium | Use connection pooling (PgBouncer built into Neon) |

---

## Competitor Analysis

| Platform | Strength | Weakness vs Our App |
|---|---|---|
| Google Maps | Accurate traffic, global | No Pune-specific incidents, no PMPML tracking |
| Waze | Community reports | No India-specific features, not Pune-focused |
| Apple Maps | Clean UI | Poor India data |
| MapMyIndia | Indian roads data | No real-time community incidents |
| **Our App** | Pune-specific, community-driven, PMPML tracking | New, small user base initially |

---

## Go-to-Market Strategy

### Week 1–4 (Launch)
- Share in Pune tech communities (PuneTech, LinkedIn)
- Post in Pune Facebook groups (Pune Traffic Updates, Pune City)
- Product Hunt launch

### Week 5–8 (Growth)
- Partner with 2–3 Hinjewadi IT companies for employee use
- Approach PMPML for official data partnership
- Local Pune media (Pune Mirror, Sakal) press coverage

### Week 9–12 (Authority)
- Approach PMC with authority dashboard demo
- Traffic Police partnership for verified incident data
- Integrate with local news for traffic updates

---

## Team Roles (if working in team)

| Role | Responsibility |
|---|---|
| Product Owner | Prioritize features, user research, roadmap |
| Frontend Dev | Next.js map UI, components, PWA |
| Backend Dev | Express API, WebSocket, Neon DB |
| DevOps | Vercel deployment, monitoring, caching |
| UI/UX Designer | Map design, mobile UX, icons |
| Data Engineer | Traffic data pipeline, predictions |
