'use client'

import { useFormState } from 'react-dom'
import type { Sneaker } from '@/lib/types'

type ActionState = { error?: string }

type Props = {
  sneaker?: Sneaker
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

const FIELD = 'border border-[#ddd] bg-white px-3 py-2 text-sm w-full focus:outline-none focus:border-[#1A1A1A] font-dm-sans'
const LABEL = 'block text-[10px] tracking-widest uppercase text-[#888] mb-1 font-dm-sans'

export default function SneakerForm({ sneaker, action }: Props) {
  const [state, formAction] = useFormState(action, {})
  const isEdit = !!sneaker

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 font-dm-sans">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={LABEL}>Name *</label>
          <input name="name" required defaultValue={sneaker?.name} className={FIELD} placeholder="z.B. Air Force 1" />
        </div>
        <div>
          <label className={LABEL}>Brand *</label>
          <input name="brand" required defaultValue={sneaker?.brand} className={FIELD} placeholder="z.B. Nike" />
        </div>
      </div>

      <div>
        <label className={LABEL}>Slug * (URL-Pfad, z.B. nike-air-force-1)</label>
        <input name="slug" required defaultValue={sneaker?.slug} className={FIELD} placeholder="nike-air-force-1" pattern="[a-z0-9-]+" />
      </div>

      <div>
        <label className={LABEL}>Beschreibung * (2 Sätze)</label>
        <textarea name="description" required defaultValue={sneaker?.description} rows={3} className={FIELD} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={LABEL}>Preis ab (€) *</label>
          <input
            name="price_min"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={sneaker ? (sneaker.price_min / 100).toFixed(2) : ''}
            className={FIELD}
            placeholder="110.00"
          />
        </div>
        <div>
          <label className={LABEL}>Badge</label>
          <select name="badge" defaultValue={sneaker?.badge ?? ''} className={FIELD}>
            <option value="">Kein Badge</option>
            <option value="Bestseller">Bestseller</option>
            <option value="Neu">Neu</option>
            <option value="Trend">Trend</option>
            <option value="Luxus">Luxus</option>
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL}>Affiliate-Link *</label>
        <input name="affiliate_url" type="url" required defaultValue={sneaker?.affiliate_url} className={FIELD} placeholder="https://www.awin1.com/..." />
      </div>

      <div>
        <label className={LABEL}>Bild-URL</label>
        <input name="image_url" type="url" defaultValue={sneaker?.image_url ?? ''} className={FIELD} placeholder="https://..." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={LABEL}>Style *</label>
          <select name="style" required defaultValue={sneaker?.style ?? 'lifestyle'} className={FIELD}>
            <option value="lifestyle">Lifestyle</option>
            <option value="sport">Sport</option>
            <option value="luxus">Luxus</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Quelle</label>
          <select name="source" defaultValue={sneaker?.source ?? 'manual'} className={FIELD}>
            <option value="manual">manual</option>
            <option value="awin">awin</option>
            <option value="amazon">amazon</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="active"
          id="active"
          defaultChecked={sneaker?.active ?? true}
          className="w-4 h-4 accent-[#1A1A1A]"
        />
        <label htmlFor="active" className="text-sm font-dm-sans">
          Aktiv (auf der Site sichtbar)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="bg-[#1A1A1A] text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-[#333] transition-colors"
        >
          {isEdit ? 'Speichern' : 'Anlegen'}
        </button>
        <a
          href="/admin"
          className="border border-[#ddd] text-[#666] text-xs tracking-widest uppercase px-6 py-3 hover:border-[#1A1A1A] transition-colors"
        >
          Abbrechen
        </a>
      </div>
    </form>
  )
}
