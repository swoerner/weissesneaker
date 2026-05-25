import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AffiliateButton from '@/components/AffiliateButton'

describe('AffiliateButton', () => {
  it('renders with correct label', () => {
    render(
      <AffiliateButton
        affiliateUrl="https://www.awin1.com/cread.php"
        label="Jetzt kaufen"
      />
    )
    expect(screen.getByRole('link', { name: 'Jetzt kaufen' })).toBeInTheDocument()
  })

  it('appends ref tracking parameter to the URL', () => {
    render(
      <AffiliateButton
        affiliateUrl="https://www.awin1.com/cread.php"
        label="Jetzt kaufen"
      />
    )
    const link = screen.getByRole('link', { name: 'Jetzt kaufen' })
    expect(link).toHaveAttribute('href', 'https://www.awin1.com/cread.php?ref=weissesneaker')
  })

  it('opens in a new tab with security attributes', () => {
    render(
      <AffiliateButton
        affiliateUrl="https://www.awin1.com/cread.php"
        label="Jetzt kaufen"
      />
    )
    const link = screen.getByRole('link', { name: 'Jetzt kaufen' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer sponsored')
  })
})
