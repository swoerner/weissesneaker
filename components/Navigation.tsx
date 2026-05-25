import Link from 'next/link'

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 bg-[#FAFAFA]/95 backdrop-blur-sm border-b border-[#E8E0D5]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-playfair text-lg font-bold tracking-widest text-[#1A1A1A] uppercase"
        >
          Weissesneaker
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/sneaker"
            className="font-dm-sans text-sm tracking-wider text-[#1A1A1A] hover:text-[#888] transition-colors uppercase"
          >
            Sneaker
          </Link>
          <Link
            href="/pflege"
            className="font-dm-sans text-sm tracking-wider text-[#1A1A1A] hover:text-[#888] transition-colors uppercase"
          >
            Pflege
          </Link>
        </div>

        {/* Mobile: simple text links */}
        <div className="flex md:hidden items-center gap-4">
          <Link href="/sneaker" className="text-sm text-[#1A1A1A]">Sneaker</Link>
          <Link href="/pflege" className="text-sm text-[#1A1A1A]">Pflege</Link>
        </div>
      </nav>
    </header>
  )
}
