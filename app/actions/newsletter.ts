// app/actions/newsletter.ts
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const EmailSchema = z.object({
  email: z.string().email('Keine gültige E-Mail-Adresse'),
})

export type NewsletterState = {
  error?: string
  success?: boolean
}

export async function subscribeNewsletter(
  _prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const parsed = EmailSchema.safeParse({ email: formData.get('email') })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = createClient()
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: parsed.data.email })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Diese E-Mail ist bereits registriert.' }
    }
    return { error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' }
  }

  return { success: true }
}
