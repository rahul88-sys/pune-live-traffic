'use client'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/store/userStore'

/**
 * Bridges the NextAuth Google session → our Zustand userStore.
 * Mounted once in the root layout — runs silently on every page.
 */
export default function AuthSync() {
  const { data: session, status } = useSession()
  const { setUser, logout, user } = useUserStore()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated' && session?.backendToken && session?.backendUser) {
      const bu = session.backendUser as {
        id: string; email: string; name: string; role: string; reputationScore: number; avatarUrl?: string
      }
      // Only update if something changed (avoids infinite re-renders)
      if (!user || user.id !== bu.id) {
        setUser(bu, session.backendToken)
      }
    } else if (status === 'unauthenticated') {
      // NextAuth session expired/signed out → clear our store too
      if (user) logout()
    }
  }, [status, session, user, setUser, logout])

  return null
}
