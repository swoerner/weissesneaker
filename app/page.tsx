import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Sneaker } from '@/lib/types'
import SneakerCard from '@/components/SneakerCard'

export const metadata: Metadata = {
  title: 'Die besten weißen Sneaker 2025 | weissesneaker.de',
  description:
    'Unsere Top-Picks für weiße Sneaker 2025 – kuratiert, unabhängig, ehrlich.',
}

async function getFeaturedSneakers(): Promise<Sneaker[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sneakers')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  if (error) {
    console.error('Supabase error:', error.message)
    return []
  }
  return data ?? []
}

export default async function HomePage() {
  const sneakers = await getFeaturedSneakers()

  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#1A1A1A] overflow-hidden">
        {/* Texture overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-36 text-center">
          <p className="font-dm-sans text-[10px] tracking-[6px] text-[#E8E0D5] uppercase mb-4">
            Weissesneaker.de — 2025
          </p>
          <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Die besten weißen
            <br />
            Sneaker 2025
          </h1>
          <p className="font-dm-sans text-sm text-[#888] mb-10 tracking-wider">
            Testberichte · Preisvergleich · Pflege-Tipps
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sneaker"
              className="font-dm-sans text-xs tracking-widest uppercase px-8 py-4 border border-[#E8E0D5] text-[#E8E0D5] hover:bg-[#E8E0D5] hover:text-[#1A1A1A] transition-colors"
            >
              Alle Sneaker
            </Link>
            <Link
              href="/sneaker?badge=Bestseller"
              className="font-dm-sans text-xs tracking-widest uppercase px-8 py-4 bg-[#E8E0D5] text-[#1A1A1A] hover:bg-white transition-colors"
            >
              Top Picks
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Sneaker Strip */}
      {sneakers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-playfair text-2xl font-bold mb-8">Aktuell beliebt</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sneakers.map((sneaker) => (
              <SneakerCard key={sneaker.id} sneaker={sneaker} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/sneaker"
              className="font-dm-sans text-xs tracking-widest uppercase px-8 py-4 bg-[#1A1A1A] text-white hover:bg-[#333] transition-colors inline-block"
            >
              Alle ansehen
            </Link>
          </div>
        </section>
      )}

      {/* Warum weiße Sneaker */}
      <section className="bg-[#E8E0D5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-playfair text-3xl font-bold mb-6">
            Warum weiße Sneaker?
          </h2>
          <p className="font-dm-sans text-[#555] leading-relaxed text-base">
            Weiße Sneaker sind das vielseitigste Schuhwerk, das du besitzen kannst.
            Sie passen zu Businesslook und Streetwear gleichermaßen, machen jeden
            Outfit cleaner und sind seit Jahrzehnten ein zeitloser Klassiker.
            Kein anderer Schuh verbindet Stil, Komfort und Wandlungsfähigkeit
            auf diese Art und Weise.
          </p>
        </div>
      </section>

      {/* Pflege-Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white border border-[#eee] p-8 md:p-12">
          <div className="flex-1">
            <p className="font-dm-sans text-xs tracking-widest uppercase text-[#888] mb-3">
              Pflegehinweise
            </p>
            <h2 className="font-playfair text-2xl font-bold mb-4">
              Weiße Sneaker sauber halten
            </h2>
            <p className="font-dm-sans text-[#555] leading-relaxed mb-6">
              Von der schnellen Grundreinigung bis zur Tiefenpflege nach Material –
              unsere Anleitung hält deine weißen Sneaker strahlend weiß.
            </p>
            <Link
              href="/pflege"
              className="font-dm-sans text-xs tracking-widest uppercase px-6 py-3 bg-[#1A1A1A] text-white hover:bg-[#333] transition-colors inline-block"
            >
              Zur Pflegeanleitung
            </Link>
          </div>
          <div className="hidden md:block w-48 h-48 bg-[#F5F5F5] flex-shrink-0" />
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'weissesneaker.de',
            url: 'https://weissesneaker.de',
            description:
              'Die besten weißen Sneaker 2025 – kuratiert, unabhängig, ehrlich.',
          }),
        }}
      />
    </>
  )
}
