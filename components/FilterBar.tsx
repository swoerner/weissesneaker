'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const PRICE_OPTIONS = [
  { label: 'Alle Preise', value: '' },
  { label: 'Unter 100 €', value: 'unter100' },
  { label: '100 – 200 €', value: '100bis200' },
  { label: 'Über 200 €', value: 'ueber200' },
]

const STYLE_OPTIONS = [
  { label: 'Alle', value: '' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'Sport', value: 'sport' },
  { label: 'Luxus', value: 'luxus' },
]

type Props = {
  brands: string[]
}

export default function FilterBar({ brands }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const currentBrand = searchParams.get('brand') ?? ''
  const currentPreis = searchParams.get('preis') ?? ''
  const currentStyle = searchParams.get('style') ?? ''

  return (
    <div className="flex flex-wrap gap-4 items-end pb-6 border-b border-[#eee] mb-8 font-dm-sans">
      {/* Brand */}
      <div className="flex flex-col gap-1">
        <label htmlFor="brand-filter" className="text-[10px] tracking-widest uppercase text-[#888]">
          Brand
        </label>
        <select
          id="brand-filter"
          aria-label="Brand"
          value={currentBrand}
          onChange={(e) => updateFilter('brand', e.target.value)}
          className="border border-[#ddd] bg-white text-sm px-3 py-2 min-w-[140px] focus:outline-none focus:border-[#1A1A1A]"
        >
          <option value="">Alle Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Preis */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-widest uppercase text-[#888]">Preisspanne</span>
        <div className="flex gap-1">
          {PRICE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter('preis', opt.value)}
              className={`text-xs px-3 py-2 border transition-colors ${
                currentPreis === opt.value
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-[#1A1A1A] border-[#ddd] hover:border-[#1A1A1A]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-widest uppercase text-[#888]">Style</span>
        <div className="flex gap-1">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter('style', opt.value)}
              className={`text-xs px-3 py-2 border transition-colors ${
                currentStyle === opt.value
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-[#1A1A1A] border-[#ddd] hover:border-[#1A1A1A]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
