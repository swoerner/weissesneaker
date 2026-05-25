'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const SneakerSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  brand: z.string().min(1, 'Brand ist erforderlich'),
  slug: z.string().min(1, 'Slug ist erforderlich').regex(/^[a-z0-9-]+$/, 'Nur Kleinbuchstaben, Zahlen und Bindestriche'),
  description: z.string().min(10, 'Beschreibung zu kurz (min. 10 Zeichen)'),
  price_min: z.coerce.number().int().positive('Preis muss positiv sein'),
  image_url: z.string().url('Keine gültige URL').or(z.literal('')).optional(),
  affiliate_url: z.string().url('Keine gültige Affiliate-URL'),
  badge: z.enum(['Bestseller', 'Neu', 'Trend', 'Luxus', '']).optional(),
  style: z.enum(['lifestyle', 'sport', 'luxus']),
  source: z.string().default('manual'),
  active: z.coerce.boolean(),
})

type ActionState = { error?: string }

export async function deleteSneaker(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('sneakers').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/sneaker')
  revalidatePath('/admin')
}

export async function createSneaker(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = SneakerSchema.safeParse({
    ...raw,
    price_min: Math.round(Number(raw.price_min) * 100), // € → Cent
    active: raw.active === 'on' || raw.active === 'true',
  })

  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(', ') }
  }

  const data = {
    ...parsed.data,
    badge: parsed.data.badge || null,
    image_url: parsed.data.image_url || null,
  }

  const supabase = createClient()
  const { error } = await supabase.from('sneakers').insert(data)
  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/sneaker')
  redirect('/admin')
}

export async function updateSneaker(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = SneakerSchema.safeParse({
    ...raw,
    price_min: Math.round(Number(raw.price_min) * 100),
    active: raw.active === 'on' || raw.active === 'true',
  })

  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(', ') }
  }

  const data = {
    ...parsed.data,
    badge: parsed.data.badge || null,
    image_url: parsed.data.image_url || null,
  }

  const supabase = createClient()
  const { error } = await supabase.from('sneakers').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/sneaker')
  redirect('/admin')
}
