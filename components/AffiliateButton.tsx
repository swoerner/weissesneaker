'use client'

import { buildAffiliateUrl } from '@/config/affiliates'

type Props = {
  affiliateUrl: string
  label?: string
  className?: string
}

export default function AffiliateButton({
  affiliateUrl,
  label = 'Jetzt kaufen',
  className,
}: Props) {
  const href = buildAffiliateUrl(affiliateUrl)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={
        className ??
        'inline-block bg-[#1A1A1A] text-[#FAFAFA] text-xs font-dm-sans tracking-widest uppercase px-5 py-3 hover:bg-[#333] transition-colors'
      }
    >
      {label}
    </a>
  )
}
