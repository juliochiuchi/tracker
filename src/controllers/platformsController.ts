import { platformsService } from "@/services/platformsService"
import type { PlatformRow } from "@/types/db/platform"
import { itemsService } from "@/services/itemsService"

export const platformsController = {
  list: (): Promise<PlatformRow[]> => platformsService.list(),

  async create(name: string): Promise<PlatformRow> {
    const normalizedName = name.trim()
    if (normalizedName.length === 0) {
      throw new Error("Informe o nome da plataforma.")
    }
    if (normalizedName.length > 30) {
      throw new Error("O nome da plataforma deve ter no máximo 30 caracteres.")
    }
    return platformsService.create({ name: normalizedName })
  },

  async update(id: string, name: string): Promise<PlatformRow> {
    const normalizedName = name.trim()
    if (normalizedName.length === 0) {
      throw new Error("Informe o nome da plataforma.")
    }
    if (normalizedName.length > 30) {
      throw new Error("O nome da plataforma deve ter no máximo 30 caracteres.")
    }

    const currentPlatform = await platformsService.getById(id)
    if (!currentPlatform) {
      throw new Error("Plataforma não encontrada.")
    }

    if (currentPlatform.name === normalizedName) {
      return currentPlatform
    }

    return platformsService.update(id, { name: normalizedName })
  },

  async remove(id: string): Promise<void> {
    const platform = await platformsService.getById(id)
    if (!platform) return

    const isLinkedToItems = await itemsService.existsWithPlatformId(platform.id)
    if (isLinkedToItems) {
      throw new Error("Não é possível excluir: existe produto vinculado a esta plataforma.")
    }

    await platformsService.remove(id)
  },
}
