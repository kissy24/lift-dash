import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'LiftDash',
  description: 'Personal strength training log and analytics dashboard.',
}

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
