import { platformsService } from "@/services/platformsService"
import type { PlatformRow } from "@/types/db/platform"

export const platformsController = {
  list: (): Promise<PlatformRow[]> => platformsService.list(),
}
