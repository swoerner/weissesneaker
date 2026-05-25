export type Badge = 'Bestseller' | 'Neu' | 'Trend' | 'Luxus'
export type Style = 'lifestyle' | 'sport' | 'luxus'

export type Sneaker = {
  id: string
  name: string
  brand: string
  slug: string
  description: string
  price_min: number        // in Cent, z.B. 11000 = 110 €
  image_url: string | null
  affiliate_url: string
  badge: Badge | null
  style: Style
  source: string           // 'manual' | 'awin' | 'amazon' etc.
  active: boolean
  created_at: string
}

export type SneakerInsert = Omit<Sneaker, 'id' | 'created_at'>
export type SneakerUpdate = Partial<SneakerInsert>

export type FilterParams = {
  brand?: string
  preis?: 'unter100' | '100bis200' | 'ueber200'
  style?: Style
}
