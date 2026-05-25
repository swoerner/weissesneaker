import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-[#FAFAFA] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="font-playfair text-lg font-bold tracking-widest uppercase mb-3">
              Weissesneaker.de
            </p>
            <p className="text-sm text-[#888] max-w-sm leading-relaxed">
              Diese Seite enthält Affiliate-Links. Bei einem Kauf über diese
              Links erhalten wir eine kleine Provision – für dich entstehen
              keine Mehrkosten.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/sneaker" className="text-sm text-[#888] hover:text-[#E8E0D5] transition-colors">
              Sneaker
            </Link>
            <Link href="/pflege" className="text-sm text-[#888] hover:text-[#E8E0D5] transition-colors">
              Pflege
            </Link>
          </div>
        </div>
        <div className="border-t border-[#333] mt-8 pt-6 text-xs text-[#555]">
          © {new Date().getFullYear()} weissesneaker.de · Alle Rechte vorbehalten
        </div>
      </div>
    </footer>
  )
}
