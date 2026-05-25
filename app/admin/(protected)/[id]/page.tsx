import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Sneaker } from '@/lib/types'
import { updateSneaker } from '../../actions'
import SneakerForm from '@/components/admin/SneakerForm'

async function getSneaker(id: string): Promise<Sneaker | null> {
  const supabase = createClient()
  const { data } = await supabase.from('sneakers').select('*').eq('id', id).single()
  return data
}

type Props = { params: { id: string } }

export default async function EditPage({ params }: Props) {
  const sneaker = await getSneaker(params.id)
  if (!sneaker) notFound()

  const boundAction = updateSneaker.bind(null, sneaker.id)

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin" className="text-sm text-[#888] hover:text-[#1A1A1A] font-dm-sans">
          ← Zurück
        </a>
        <h1 className="font-playfair text-2xl font-bold">
          {sneaker.name} bearbeiten
        </h1>
      </div>
      <SneakerForm sneaker={sneaker} action={boundAction} />
    </div>
  )
}
