import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppLayout } from '@/components/app-layout'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Ads Optimization Advisor',
  description:
    'Analyze your ad campaigns with AI-powered insights and recommendations',
  icons: {
    icon: [
      {
        url: '/icon.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='font-sans antialiased bg-background text-foreground'>
        <Toaster richColors />
        <AppLayout>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </AppLayout>
      </body>
    </html>
  )
}
