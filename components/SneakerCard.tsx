import Image from 'next/image'
import type { Sneaker } from '@/lib/types'
import AffiliateButton from './AffiliateButton'

const BADGE_STYLES: Record<string, string> = {
  Bestseller: 'bg-[#1A1A1A] text-[#E8E0D5]',
  Trend:      'bg-[#1A1A1A] text-[#E8E0D5]',
  Neu:        'bg-[#E8E0D5] text-[#1A1A1A]',
  Luxus:      'bg-[#E8E0D5] text-[#1A1A1A]',
}

type Props = {
  sneaker: Sneaker
}

export default function SneakerCard({ sneaker }: Props) {
  const { name, brand, description, price_min, image_url, affiliate_url, badge } = sneaker
  const priceEur = (price_min / 100).toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return (
    <article className="bg-white border border-[#eee] group hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex flex-col">
      {/* Image */}
      <div className="relative bg-[#F5F5F5] aspect-[4/3] overflow-hidden">
        {badge && (
          <span
            className={`absolute top-3 left-3 z-10 text-[10px] font-dm-sans tracking-widest uppercase px-2 py-1 ${BADGE_STYLES[badge] ?? 'bg-[#1A1A1A] text-[#FAFAFA]'}`}
          >
            {badge}
          </span>
        )}
        {image_url ? (
          <Image
            src={image_url}
            alt={`${name} von ${brand} – weißer Sneaker`}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#ccc] text-sm font-dm-sans">
            Bild folgt
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-[#888] uppercase tracking-wider mb-1 font-dm-sans">{brand}</p>
        <h3 className="font-playfair text-base font-bold mb-2">{name}</h3>
        <p className="text-sm text-[#555] leading-relaxed mb-4 flex-1 font-dm-sans">{description}</p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#f0f0f0]">
          <span className="font-playfair font-bold text-base">ab {priceEur} €</span>
          <AffiliateButton affiliateUrl={affiliate_url} />
        </div>
      </div>
    </article>
  )
}
