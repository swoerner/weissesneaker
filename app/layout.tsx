import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'Die besten weißen Sneaker 2025 | weissesneaker.de',
    template: '%s | weissesneaker.de',
  },
  description:
    'Unsere Top-Picks für weiße Sneaker 2025 – kuratiert, unabhängig, ehrlich. Nike, Adidas, Veja und mehr.',
  metadataBase: new URL('https://weissesneaker.de'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-[#FAFAFA] text-[#1A1A1A] font-[family-name:var(--font-dm-sans)] antialiased">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
