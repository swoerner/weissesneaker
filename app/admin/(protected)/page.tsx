import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Sneaker } from '@/lib/types'
import { deleteSneaker } from '../actions'

async function getAllSneakers(): Promise<Sneaker[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sneakers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Supabase error:', error.message)
    return []
  }
  return data ?? []
}

export default async function AdminSneakerList() {
  const sneakers = await getAllSneakers()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-playfair text-2xl font-bold">
          Sneaker ({sneakers.length})
        </h1>
        <Link
          href="/admin/neu"
          className="bg-[#1A1A1A] text-white text-xs tracking-widest uppercase px-5 py-3 hover:bg-[#333] transition-colors"
        >
          + Neuer Sneaker
        </Link>
      </div>

      <div className="bg-white border border-[#eee] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-[#F5F5F5] text-[10px] font-dm-sans tracking-widest uppercase text-[#888]">
          <div>Name</div>
          <div>Brand</div>
          <div>Preis</div>
          <div>Status</div>
          <div>Aktionen</div>
        </div>

        {sneakers.length === 0 && (
          <div className="px-4 py-8 text-center text-[#888] font-dm-sans text-sm">
            Noch keine Sneaker. Klick auf &quot;+ Neuer Sneaker&quot;.
          </div>
        )}

        {sneakers.map((sneaker) => (
          <div
            key={sneaker.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-t border-[#f0f0f0] items-center"
          >
            <div className="font-playfair font-semibold text-sm">{sneaker.name}</div>
            <div className="font-dm-sans text-sm text-[#666]">{sneaker.brand}</div>
            <div className="font-dm-sans text-sm">
              {(sneaker.price_min / 100).toLocaleString('de-DE')} €
            </div>
            <div>
              <span
                className={`text-[10px] font-dm-sans tracking-wider px-2 py-1 ${
                  sneaker.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {sneaker.active ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/${sneaker.id}`}
                className="text-xs font-dm-sans text-[#555] hover:text-[#1A1A1A] transition-colors"
              >
                Bearbeiten
              </Link>
              <form action={deleteSneaker.bind(null, sneaker.id)}>
                <button
                  type="submit"
                  className="text-xs font-dm-sans text-red-500 hover:text-red-700 transition-colors"
                >
                  Löschen
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
