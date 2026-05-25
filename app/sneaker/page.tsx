import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Sneaker, FilterParams } from '@/lib/types'
import SneakerCard from '@/components/SneakerCard'
import FilterBar from '@/components/FilterBar'

export const metadata: Metadata = {
  title: 'Weiße Sneaker kaufen – Top 12 Empfehlungen 2025',
  description:
    'Die schönsten weißen Sneaker im Vergleich: Nike, Adidas, Veja, Common Projects und mehr.',
}

async function getSneakers(filters: FilterParams): Promise<Sneaker[]> {
  const supabase = createClient()
  let query = supabase.from('sneakers').select('*').eq('active', true)

  if (filters.brand) {
    query = query.eq('brand', filters.brand)
  }
  if (filters.style) {
    query = query.eq('style', filters.style)
  }
  if (filters.preis === 'unter100') {
    query = query.lt('price_min', 10000)
  } else if (filters.preis === '100bis200') {
    query = query.gte('price_min', 10000).lte('price_min', 20000)
  } else if (filters.preis === 'ueber200') {
    query = query.gt('price_min', 20000)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) {
    console.error('Supabase error:', error.message)
    return []
  }
  return data ?? []
}

async function getAllBrands(): Promise<string[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('sneakers')
    .select('brand')
    .eq('active', true)
  const brandSet = new Set((data ?? []).map((r) => r.brand as string))
  const brands = Array.from(brandSet).sort()
  return brands
}

type PageProps = {
  searchParams: { brand?: string; preis?: string; style?: string }
}

export default async function SneakerPage({ searchParams }: PageProps) {
  const filters: FilterParams = {
    brand: searchParams.brand,
    preis: searchParams.preis as FilterParams['preis'],
    style: searchParams.style as FilterParams['style'],
  }

  const [sneakers, brands] = await Promise.all([
    getSneakers(filters),
    getAllBrands(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold mb-2">
          Weiße Sneaker 2025
        </h1>
        <p className="font-dm-sans text-[#888] text-sm">
          {sneakers.length} Modelle
        </p>
      </div>

      <Suspense fallback={null}>
        <FilterBar brands={brands} />
      </Suspense>

      {sneakers.length === 0 ? (
        <div className="text-center py-24 text-[#888] font-dm-sans">
          Keine Sneaker für diese Filterauswahl gefunden.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sneakers.map((sneaker) => (
            <SneakerCard key={sneaker.id} sneaker={sneaker} />
          ))}
        </div>
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Weiße Sneaker 2025',
            url: 'https://weissesneaker.de/sneaker',
            numberOfItems: sneakers.length,
            itemListElement: sneakers.map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Product',
                name: s.name,
                brand: { '@type': 'Brand', name: s.brand },
                offers: {
                  '@type': 'Offer',
                  price: (s.price_min / 100).toFixed(2),
                  priceCurrency: 'EUR',
                  url: s.affiliate_url,
                },
              },
            })),
          }),
        }}
      />
    </div>
  )
}
