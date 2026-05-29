import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewsletterExport from '@/components/admin/NewsletterExport'

describe('NewsletterExport', () => {
  const subscribers = [
    { email: 'a@example.com', created_at: '2026-05-29T10:00:00Z' },
    { email: 'b@example.com', created_at: '2026-05-28T09:00:00Z' },
  ]

  it('renders export button', () => {
    render(<NewsletterExport subscribers={subscribers} />)
    expect(screen.getByRole('button', { name: /csv exportieren/i })).toBeInTheDocument()
  })

  it('triggers a download on click', async () => {
    const createObjectURL = jest.fn(() => 'blob:mock')
    const revokeObjectURL = jest.fn()
    global.URL.createObjectURL = createObjectURL
    global.URL.revokeObjectURL = revokeObjectURL

    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    render(<NewsletterExport subscribers={subscribers} />)
    await userEvent.click(screen.getByRole('button', { name: /csv exportieren/i }))

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalled()

    clickSpy.mockRestore()
  })
})
