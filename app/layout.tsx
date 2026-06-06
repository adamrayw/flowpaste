import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'FlowPaste',
    template: '%s | FlowPaste',
  },
  description:
    'FlowPaste is a modern code-sharing workspace with syntax highlighting, privacy controls, collections, and AI-powered developer tools.',
  keywords: [
    'code sharing',
    'pastebin alternative',
    'developer tools',
    'syntax highlighting',
    'OpenRouter',
    'AI code assistant',
  ],
  applicationName: 'FlowPaste',
  authors: [{ name: 'Raytech Cloud' }],
  creator: 'Raytech Cloud',
  publisher: 'Raytech Cloud',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FlowPaste',
    description:
      'Share code smarter with syntax highlighting, privacy controls, analytics, and AI tools.',
    url: '/',
    siteName: 'FlowPaste',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'FlowPaste',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'FlowPaste',
    description:
      'Share code smarter with syntax highlighting, privacy controls, analytics, and AI tools.',
    images: ['/og'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    shortcut: '/icon-light-32x32.png',
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/brand/flowpaste-logo.png',
        type: 'image/png',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
