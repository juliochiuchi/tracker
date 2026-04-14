export interface ItemsPurchasedRow {
  id: string
  name: string
  price: number
  platform: string
  tracking_code: string | null
  delivery_time: string | null
  delivered: boolean
  created_at: string
}
