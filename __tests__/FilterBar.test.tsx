import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next/navigation before import
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => '/sneaker',
}))

import FilterBar from '@/components/FilterBar'

const BRANDS = ['Nike', 'Adidas', 'New Balance', 'Common Projects', 'Veja']

describe('FilterBar', () => {
  it('renders all filter sections', () => {
    render(<FilterBar brands={BRANDS} />)
    expect(screen.getByLabelText('Brand')).toBeInTheDocument()
    expect(screen.getByText('Alle')).toBeInTheDocument()
    expect(screen.getByText('Lifestyle')).toBeInTheDocument()
    expect(screen.getByText('Sport')).toBeInTheDocument()
    expect(screen.getByText('Luxus')).toBeInTheDocument()
  })

  it('renders brand options from props', () => {
    render(<FilterBar brands={BRANDS} />)
    BRANDS.forEach((brand) => {
      expect(screen.getByRole('option', { name: brand })).toBeInTheDocument()
    })
  })
})
