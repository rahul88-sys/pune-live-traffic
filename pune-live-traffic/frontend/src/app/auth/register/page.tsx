'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// No separate register page — Google OAuth creates accounts automatically.
// Redirect straight to the sign-in page.
export default function RegisterPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/auth/login') }, [router])
  return null
}
