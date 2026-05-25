import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Admin Nav */}
      <header className="bg-[#1A1A1A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-dm-sans text-[10px] tracking-widest uppercase text-[#E8E0D5]">
              Weissesneaker · Admin
            </span>
            <a
              href="/admin"
              className="text-xs text-[#888] hover:text-white transition-colors"
            >
              Sneaker
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#888]">
            <span>{user.email}</span>
            <form action="/admin/logout" method="post">
              <button type="submit" className="text-[#E8E0D5] hover:text-white transition-colors">
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
