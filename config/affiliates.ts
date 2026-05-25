export const TRACKING_REF = 'weissesneaker'

/**
 * Appends ?ref=weissesneaker (or &ref=...) to an affiliate URL.
 * Pure function — safe to test.
 */
export function buildAffiliateUrl(url: string): string {
  if (!url) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}ref=${TRACKING_REF}`
}
