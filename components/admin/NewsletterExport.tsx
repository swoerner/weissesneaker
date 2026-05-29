'use client'

type Subscriber = { email: string; created_at: string }

export default function NewsletterExport({ subscribers }: { subscribers: Subscriber[] }) {
  function handleExport() {
    const rows = [
      'email,created_at',
      ...subscribers.map((s) => `${s.email},${s.created_at}`),
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="font-dm-sans text-xs tracking-widest uppercase px-5 py-3 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
    >
      CSV exportieren
    </button>
  )
}
