import { itemsService } from "@/services/itemsService"
import type { ItemsPurchasedRow } from "@/types/db/itemsPurchased"

export const itemsController = {
  list: (): Promise<ItemsPurchasedRow[]> => itemsService.list(),
  create: (input: {
    name: string
    price: number
    platform: string
    tracking_code: string | null
    delivery_time: string | null
    delivered: boolean
  }): Promise<ItemsPurchasedRow> => itemsService.create(input),
  setDelivered: (id: string, delivered: boolean): Promise<ItemsPurchasedRow> =>
    itemsService.setDelivered(id, delivered),
  update: (
    id: string,
    patch: Partial<{
      name: string
      price: number
      platform: string
      tracking_code: string | null
      delivery_time: string | null
      delivered: boolean
    }>
  ): Promise<ItemsPurchasedRow> => itemsService.update(id, patch),
  remove: (id: string): Promise<void> => itemsService.remove(id),
}
