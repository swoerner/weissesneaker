'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { subscribeNewsletter, type NewsletterState } from '@/app/actions/newsletter'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-dm-sans text-xs tracking-widest uppercase px-6 py-3 bg-[#1A1A1A] text-white hover:bg-[#333] transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {pending ? 'Wird angemeldet...' : 'Anmelden'}
    </button>
  )
}

const initialState: NewsletterState = {}

export default function NewsletterForm() {
  const [state, formAction] = useFormState(subscribeNewsletter, initialState)

  if (state.success) {
    return (
      <p className="font-dm-sans text-sm text-[#1A1A1A] font-medium">
        Danke! Du bist jetzt dabei.
      </p>
    )
  }

  return (
    <form action={formAction} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <input
          type="email"
          name="email"
          required
          placeholder="deine@email.de"
          className="w-full border border-[#ddd] px-3 py-3 text-sm focus:outline-none focus:border-[#1A1A1A] font-dm-sans"
        />
        {state.error && (
          <p className="text-xs text-red-600 mt-1 font-dm-sans">{state.error}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  )
}
