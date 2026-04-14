import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Karlsruhe Events',
  description: 'Alle Veranstaltungen in Karlsruhe auf einen Blick – Konzerte, Kultur, Partys, Flohmärkte und mehr.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={geist.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
