import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: string
  reputationScore: number
  avatarUrl?: string
}

interface UserStore {
  user: User | null
  token: string | null
  setUser: (user: User, token: string) => void
  logout: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user, token) => {
        localStorage.setItem('auth_token', token)
        set({ user, token })
      },
      logout: () => {
        localStorage.removeItem('auth_token')
        set({ user: null, token: null })
      },
    }),
    { name: 'user-store' }
  )
)
