import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from '@/components/Providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Pune Live Traffic',
  description: 'Real-time traffic intelligence for Pune city',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${inter.className} h-full`}>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'rgba(28, 28, 30, 0.92)',
                color: '#f5f5f7',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'saturate(180%) blur(20px)',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: '500',
                letterSpacing: '-0.01em',
                padding: '12px 18px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              },
              success: { iconTheme: { primary: '#30d158', secondary: '#1c1c1e' } },
              error:   { iconTheme: { primary: '#ff453a', secondary: '#1c1c1e' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
