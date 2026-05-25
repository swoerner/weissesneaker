import { buildAffiliateUrl, TRACKING_REF } from '@/config/affiliates'

describe('buildAffiliateUrl', () => {
  it('appends ?ref=weissesneaker to a URL without query params', () => {
    const result = buildAffiliateUrl('https://www.awin1.com/cread.php')
    expect(result).toBe('https://www.awin1.com/cread.php?ref=weissesneaker')
  })

  it('appends &ref=weissesneaker to a URL that already has query params', () => {
    const result = buildAffiliateUrl('https://www.awin1.com/cread.php?awinmid=123')
    expect(result).toBe('https://www.awin1.com/cread.php?awinmid=123&ref=weissesneaker')
  })

  it('returns empty string unchanged', () => {
    expect(buildAffiliateUrl('')).toBe('')
  })

  it('uses the TRACKING_REF constant', () => {
    expect(TRACKING_REF).toBe('weissesneaker')
  })
})
