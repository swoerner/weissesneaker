import { createSneaker } from '../../actions'
import SneakerForm from '@/components/admin/SneakerForm'

export default function NeuPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin" className="text-sm text-[#888] hover:text-[#1A1A1A] font-dm-sans">
          ← Zurück
        </a>
        <h1 className="font-playfair text-2xl font-bold">Neuer Sneaker</h1>
      </div>
      <SneakerForm action={createSneaker} />
    </div>
  )
}
