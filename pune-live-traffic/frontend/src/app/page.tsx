import Link from "next/link";
import { MapPin, Zap, Shield, Bus, Navigation, Radio, ChevronRight } from "lucide-react";
import HomeNav from "@/components/HomeNav";

const stats = [
  { value: "2.8M+", label: "Daily commuters" },
  { value: "340+",  label: "Incidents today" },
  { value: "< 30s", label: "Update latency" },
  { value: "18",    label: "Zones covered" },
];

const features = [
  {
    icon: MapPin,
    color: "#ff9500",
    label: "Live Incident Reports",
    desc: "Accidents, potholes, waterlogging — crowd-sourced and verified in real time across all Pune zones.",
  },
  {
    icon: Bus,
    color: "#0a84ff",
    label: "PMPML Bus Tracker",
    desc: "Real-time bus locations across all routes. Know exactly when your bus arrives.",
  },
  {
    icon: Navigation,
    color: "#bf5af2",
    label: "Smart Route Planner",
    desc: "The fastest path calculated dynamically around live traffic conditions.",
  },
  {
    icon: Shield,
    color: "#30d158",
    label: "Community Verified",
    desc: "Upvotes and reputation scores ensure only accurate data reaches you.",
  },
  {
    icon: Zap,
    color: "#ffd60a",
    label: "Instant Alerts",
    desc: "Push notifications the moment an incident appears on your saved routes.",
  },
  {
    icon: Radio,
    color: "#64d2ff",
    label: "WebSocket Live Feed",
    desc: "Sub-second propagation. Every device in the city stays in sync.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-[#f5f5f7]">
      <HomeNav />

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        {/* Ambient glow — very subtle, Apple style */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,149,0,0.08) 0%, transparent 70%),
              radial-gradient(ellipse 60% 40% at 80% 80%, rgba(10,132,255,0.05) 0%, transparent 70%)
            `,
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Live chip */}
          <div className="fade-up inline-flex items-center gap-2 surface rounded-full px-3.5 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#30d158] live-ring" />
            <span className="text-xs text-[#30d158] font-medium tracking-wide">Live · Pune City</span>
          </div>

          {/* Headline */}
          <h1 className="fade-up-d1 text-[clamp(3rem,8vw,6.5rem)] font-black leading-[0.95] tracking-tight mb-6">
            Navigate Pune{" "}
            <span className="headline-gradient">Smarter.</span>
          </h1>

          <p className="fade-up-d2 text-lg sm:text-xl text-white/50 max-w-xl mx-auto leading-relaxed mb-10 font-light">
            Crowd-sourced traffic intelligence updated every 30 seconds.
            Report incidents, track buses, outsmart every jam.
          </p>

          {/* CTAs */}
          <div className="fade-up-d3 flex flex-col sm:flex-row gap-3 justify-center mb-20">
            <Link
              href="/map"
              className="btn-apple inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[15px]"
            >
              <MapPin className="w-4 h-4" />
              Open Live Map
            </Link>
            <Link
              href="/auth/register"
              className="btn-ghost inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[15px]"
            >
              Join the Community
              <ChevronRight className="w-4 h-4 opacity-50" />
            </Link>
          </div>

          {/* Stats */}
          <div className="fade-up-d4 surface rounded-3xl p-px overflow-hidden">
            <div className="bg-[#0a0a0a] rounded-[calc(1.5rem-1px)] grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.06]">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`py-6 px-4 text-center ${i > 1 ? 'hidden sm:block' : ''}`}
                >
                  <div className="text-3xl font-black tracking-tight text-white mb-1">{s.value}</div>
                  <div className="text-xs text-white/35 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <hr className="divider max-w-6xl mx-auto" />

      {/* ── Features ── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-[#ff9500] uppercase tracking-widest mb-3">Platform</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-3">
            Everything on one map.
          </h2>
          <p className="text-white/40 text-base max-w-md mx-auto font-light">
            Built for Pune&apos;s roads — from Kothrud to Hadapsar, Wakad to Viman Nagar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-3xl overflow-hidden">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                className="bg-black p-8 group hover:bg-[#0a0a0a] transition-colors duration-300"
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2 tracking-tight">{f.label}</h3>
                <p className="text-sm text-white/40 leading-relaxed font-light">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="pb-24 px-6">
        <div
          className="max-w-3xl mx-auto rounded-3xl p-px"
          style={{ background: 'linear-gradient(135deg, rgba(255,149,0,0.3) 0%, rgba(10,132,255,0.2) 100%)' }}
        >
          <div className="bg-[#080808] rounded-[calc(1.5rem-1px)] p-12 text-center">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Start reporting.<br />
              <span className="headline-gradient">Help Pune move.</span>
            </h2>
            <p className="text-white/40 mb-8 font-light">Free forever. No ads. Just better commutes.</p>
            <Link href="/auth/register" className="btn-apple inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              Create free account
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-white/20">© 2025 Pune Live Traffic</span>
          <span className="text-xs text-white/20">Built with care for 2.8M commuters</span>
        </div>
      </footer>
    </div>
  );
}
