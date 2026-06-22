'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { signOut } from 'next-auth/react'
import { MapPin, LogOut } from 'lucide-react'

export default function HomeNav() {
  const [mounted, setMounted] = useState(false)
  const { user, logout } = useUserStore()

  useEffect(() => setMounted(true), [])

  async function handleLogout() {
    logout()
    await signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="fixed top-0 inset-x-0 z-50 nav-blur border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
        <Link href="/" className="text-[15px] font-semibold tracking-tight text-white/90 hover:text-white transition-colors duration-200">
          Pune Traffic
        </Link>

        <div className="flex items-center gap-1">
          {mounted && user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 mr-2">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full border border-white/10" />
                ) : (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: 'rgba(255,149,0,0.2)', border: '1px solid rgba(255,149,0,0.3)', color: '#ff9500' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-[13px] text-white/50">{user.name.split(' ')[0]}</span>
              </div>
              <Link href="/map" className="btn-apple inline-flex items-center gap-1.5 text-sm px-4 py-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Open Map
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors duration-200 px-2 py-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-white/50 hover:text-white transition-colors duration-200 px-4 py-1.5 rounded-full hover:bg-white/6">
                Sign In
              </Link>
              <Link href="/auth/login" className="btn-apple text-sm px-4 py-1.5">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
