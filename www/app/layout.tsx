import { Analytics } from '@vercel/analytics/next'
import { RootProvider } from 'fumadocs-ui/provider/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'

import { baseUrl, siteConfig } from '~/config/site'
import { cn } from '~/lib/utils'

const GeistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const GeistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  description: siteConfig.description,
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: new URL(baseUrl),
  openGraph: {
    description: siteConfig.description,
    locale: 'en_US',
    siteName: siteConfig.title,
    title: siteConfig.title,
    type: 'website',
    url: baseUrl,
  },
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    index: true,
  },
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  twitter: {
    card: 'summary_large_image',
    creator: siteConfig.socialLinks.twitter.name,
    description: siteConfig.description,
    title: siteConfig.title,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { color: 'white', media: '(prefers-color-scheme: light)' },
    { color: 'black', media: '(prefers-color-scheme: dark)' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn(
          GeistSans.variable,
          GeistMono.variable,
          'font-sans antialiased flex flex-col min-h-screen',
        )}
      >
        <RootProvider>{children}</RootProvider>
        <Analytics />
      </body>
    </html>
  )
}
