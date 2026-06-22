'use client'
import { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Shield, Zap, Users } from 'lucide-react'

const perks = [
  { icon: MapPin,  text: 'Report accidents, potholes & waterlogging instantly' },
  { icon: Shield,  text: 'Earn reputation as your reports get verified' },
  { icon: Zap,     text: 'Get live alerts the moment your route is affected' },
  { icon: Users,   text: 'Join 12,000+ active reporters across Pune' },
]

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Already signed in → go to map
  useEffect(() => {
    if (status === 'authenticated' && session?.backendToken) {
      router.replace('/map')
    }
  }, [status, session, router])

  async function handleGoogleSignIn() {
    setLoading(true)
    await signIn('google', { callbackUrl: '/map' })
    // loading stays true until redirect completes
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: '#080808' }} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 70% 55% at 25% 55%, rgba(255,149,0,0.09) 0%, transparent 65%),
              radial-gradient(ellipse 50% 40% at 80% 20%, rgba(10,132,255,0.06) 0%, transparent 65%)
            `,
          }}
        />

        <div className="relative flex flex-col h-full p-14">
          <Link href="/" className="text-[15px] font-semibold text-white/70 hover:text-white transition-colors duration-200 w-fit">
            ← Pune Traffic
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <div className="flex items-center gap-2 mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] live-ring" />
              <span className="text-xs text-[#30d158] font-medium">340+ incidents reported today</span>
            </div>

            <h2 className="text-5xl font-black tracking-tight text-white leading-[1.05] mb-5">
              The fastest way to<br />
              <span className="headline-gradient">navigate Pune.</span>
            </h2>
            <p className="text-white/40 text-[15px] leading-relaxed font-light mb-10">
              Join thousands of Punekars who report incidents in real time — and help every commuter reach home faster.
            </p>

            <div className="space-y-4">
              {perks.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,149,0,0.1)', border: '1px solid rgba(255,149,0,0.2)' }}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#ff9500]" />
                  </div>
                  <span className="text-[13px] text-white/50 leading-relaxed pt-0.5">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-white/15">Free forever · No ads · No spam</p>
        </div>
      </div>

      {/* ── Right sign-in panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="absolute inset-y-0 left-0 w-px bg-white/[0.06] hidden lg:block" />

        <div className="w-full max-w-[360px]">
          {/* Mobile back link */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-10">
            <span className="text-sm font-semibold text-white/50">← Pune Traffic</span>
          </Link>

          <div className="fade-up mb-10">
            <h1 className="text-[2rem] font-black tracking-tight text-white mb-2">Sign in</h1>
            <p className="text-[15px] text-white/40 font-light">
              Use your Google account — no passwords, no forms.
            </p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="fade-up-d1 w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold text-[15px] tracking-tight transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#f5f5f7',
            }}
            onMouseEnter={e => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.13)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'
            }}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/70 animate-spin flex-shrink-0" />
                <span>Connecting to Google…</span>
              </>
            ) : (
              <>
                {/* Official Google G logo */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="fade-up-d2 text-[11px] text-white/20 text-center mt-5 leading-relaxed">
            By continuing you agree to our{' '}
            <span className="underline cursor-pointer hover:text-white/40 transition-colors">Terms of Service</span>
            {' & '}
            <span className="underline cursor-pointer hover:text-white/40 transition-colors">Privacy Policy</span>.
            <br />We only request your name and email from Google.
          </p>

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
            <Link href="/map" className="text-xs text-white/25 hover:text-white/50 transition-colors duration-200">
              Continue browsing the map without signing in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
