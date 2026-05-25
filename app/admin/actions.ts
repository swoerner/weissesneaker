'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteSneaker(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('sneakers').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/sneaker')
  revalidatePath('/admin')
}

export async function createSneaker(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: { error?: string },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData
): Promise<{ error?: string }> {
  // Full implementation in Task 13
  return {}
}

export async function updateSneaker(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _id: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: { error?: string },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData
): Promise<{ error?: string }> {
  // Full implementation in Task 13
  return {}
}
