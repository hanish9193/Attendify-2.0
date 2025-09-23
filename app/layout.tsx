import type { Metadata } from 'next'
import AuthSessionProvider from '@/components/providers/session-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Attendify',
  description: 'Attendify',
  generator: 'Attendify',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  )
}
