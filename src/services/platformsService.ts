import { supabaseHttp } from "@/services/supabaseHttp"
import type { PlatformRow } from "@/types/db/platform"

const TABLE = "platforms"

export const platformsService = {
  async list(): Promise<PlatformRow[]> {
    const response = await supabaseHttp.get<PlatformRow[]>(`/${TABLE}`, {
      params: {
        select: "id,name,created_at",
        order: "name.asc",
      },
    })
    return response.data
  },

  async getById(id: string): Promise<PlatformRow | null> {
    const response = await supabaseHttp.get<PlatformRow[]>(`/${TABLE}`, {
      params: {
        select: "id,name,created_at",
        id: `eq.${id}`,
        limit: 1,
      },
    })
    return response.data[0] ?? null
  },

  async create(input: { name: string }): Promise<PlatformRow> {
    const response = await supabaseHttp.post<PlatformRow[]>(`/${TABLE}`, input, {
      headers: { Prefer: "return=representation" },
    })
    const [created] = response.data
    if (!created) {
      throw new Error("Create failed: empty response")
    }
    return created
  },

  async update(id: string, patch: Partial<{ name: string }>): Promise<PlatformRow> {
    const response = await supabaseHttp.patch<PlatformRow[]>(`/${TABLE}`, patch, {
      params: { id: `eq.${id}` },
      headers: { Prefer: "return=representation" },
    })
    const [updated] = response.data
    if (!updated) {
      throw new Error("Update failed: empty response")
    }
    return updated
  },

  async remove(id: string): Promise<void> {
    await supabaseHttp.delete(`/${TABLE}`, { params: { id: `eq.${id}` } })
  },
}
