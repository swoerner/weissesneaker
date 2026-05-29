import { createClient } from '@/lib/supabase/server'
import NewsletterExport from '@/components/admin/NewsletterExport'

type Subscriber = { id: string; email: string; created_at: string }

async function getSubscribers(): Promise<Subscriber[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase error:', error.message)
    return []
  }
  return data ?? []
}

export default async function NewsletterAdminPage() {
  const subscribers = await getSubscribers()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-playfair text-2xl font-bold">
          {subscribers.length} Abonnenten
        </h1>
        <NewsletterExport subscribers={subscribers} />
      </div>

      <div className="bg-white border border-[#eee] overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 bg-[#F5F5F5] text-[10px] font-dm-sans tracking-widest uppercase text-[#888]">
          <div>E-Mail</div>
          <div>Angemeldet am</div>
        </div>

        {subscribers.length === 0 && (
          <div className="px-4 py-8 text-center text-[#888] font-dm-sans text-sm">
            Noch keine Abonnenten.
          </div>
        )}

        {subscribers.map((subscriber) => (
          <div
            key={subscriber.id}
            className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 border-t border-[#f0f0f0] items-center"
          >
            <div className="font-dm-sans text-sm">{subscriber.email}</div>
            <div className="font-dm-sans text-sm text-[#666]">
              {new Date(subscriber.created_at).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
