import { supabaseHttp } from "@/services/supabaseHttp"
import type { ItemsPurchasedRow } from "@/types/db/itemsPurchased"

const TABLE = "items_purchased"

export const itemsService = {
  async list(): Promise<ItemsPurchasedRow[]> {
    const response = await supabaseHttp.get<ItemsPurchasedRow[]>(`/${TABLE}`, {
      params: {
        select:
          "id,name,price,platform,tracking_code,delivery_time,delivered,created_at",
        order: "created_at.desc",
      },
    })
    return response.data
  },

  async create(input: {
    name: string
    price: number
    platform: string
    tracking_code: string | null
    delivery_time: string | null
    delivered: boolean
  }): Promise<ItemsPurchasedRow> {
    const response = await supabaseHttp.post<ItemsPurchasedRow[]>(`/${TABLE}`, input, {
      headers: { Prefer: "return=representation" },
    })
    const [created] = response.data
    if (!created) {
      throw new Error("Create failed: empty response")
    }
    return created
  },

  async setDelivered(id: string, delivered: boolean): Promise<ItemsPurchasedRow> {
    const response = await supabaseHttp.patch<ItemsPurchasedRow[]>(
      `/${TABLE}`,
      { delivered },
      {
        params: { id: `eq.${id}` },
        headers: { Prefer: "return=representation" },
      }
    )
    const [updated] = response.data
    if (!updated) {
      throw new Error("Update failed: empty response")
    }
    return updated
  },

  async update(
    id: string,
    patch: Partial<{
      name: string
      price: number
      platform: string
      tracking_code: string | null
      delivery_time: string | null
      delivered: boolean
    }>
  ): Promise<ItemsPurchasedRow> {
    const response = await supabaseHttp.patch<ItemsPurchasedRow[]>(
      `/${TABLE}`,
      patch,
      {
        params: { id: `eq.${id}` },
        headers: { Prefer: "return=representation" },
      }
    )
    const [updated] = response.data
    if (!updated) {
      throw new Error("Update failed: empty response")
    }
    return updated
  },

  async remove(id: string): Promise<void> {
    await supabaseHttp.delete(`/${TABLE}`, {
      params: { id: `eq.${id}` },
    })
  },

  async existsWithPlatformId(platformId: string): Promise<boolean> {
    const response = await supabaseHttp.get<Pick<ItemsPurchasedRow, "id">[]>(
      `/${TABLE}`,
      {
        params: {
          select: "id",
          platform: `eq.${platformId}`,
          limit: 1,
        },
      }
    )

    return response.data.length > 0
  },
}
