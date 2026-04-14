import { supabaseHttp } from "@/services/supabaseHttp"
import type { PlatformRow } from "@/types/db/platform"

const TABLE = "platforms"

export const platformsService = {
  async list(): Promise<PlatformRow[]> {
    const res = await supabaseHttp.get<PlatformRow[]>(`/${TABLE}`, {
      params: {
        select: "id,name,created_at",
        order: "name.asc",
      },
    })
    return res.data
  },
}
