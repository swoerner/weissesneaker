import { render, screen } from '@testing-library/react'
import { useFormState, useFormStatus } from 'react-dom'
import NewsletterForm from '@/components/NewsletterForm'

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormState: jest.fn(),
  useFormStatus: jest.fn(),
}))

const mockUseFormState = useFormState as jest.Mock
const mockUseFormStatus = useFormStatus as jest.Mock

describe('NewsletterForm', () => {
  beforeEach(() => {
    mockUseFormStatus.mockReturnValue({ pending: false })
  })

  it('renders email input and submit button', () => {
    mockUseFormState.mockReturnValue([{}, jest.fn()])
    render(<NewsletterForm />)
    expect(screen.getByPlaceholderText('deine@email.de')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /anmelden/i })).toBeInTheDocument()
  })

  it('shows success message when state.success is true', () => {
    mockUseFormState.mockReturnValue([{ success: true }, jest.fn()])
    render(<NewsletterForm />)
    expect(screen.getByText('Danke! Du bist jetzt dabei.')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('deine@email.de')).not.toBeInTheDocument()
  })

  it('shows error message from state.error', () => {
    mockUseFormState.mockReturnValue([{ error: 'Diese E-Mail ist bereits registriert.' }, jest.fn()])
    render(<NewsletterForm />)
    expect(screen.getByText('Diese E-Mail ist bereits registriert.')).toBeInTheDocument()
  })

  it('shows pending state on submit button while loading', () => {
    mockUseFormState.mockReturnValue([{}, jest.fn()])
    mockUseFormStatus.mockReturnValue({ pending: true })
    render(<NewsletterForm />)
    expect(screen.getByRole('button', { name: /wird angemeldet/i })).toBeDisabled()
  })
})
