import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function POST(_request: NextRequest) {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
