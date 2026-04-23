import { useEffect, useMemo, useState } from "react"

import { platformsController } from "@/controllers/platformsController"
import { toast } from "@/hooks/use-toast"
import type { PlatformRow } from "@/types/db/platform"

const sortPlatformsByName = (platforms: PlatformRow[]): PlatformRow[] =>
  [...platforms].sort((first, second) => first.name.localeCompare(second.name))

const buildOptimisticPlatform = (name: string): PlatformRow => {
  const now = new Date().toISOString()
  const temporaryId =
    globalThis.crypto?.randomUUID?.() ?? `tmp_${Math.random().toString(16).slice(2)}`

  return { id: temporaryId, name, created_at: now }
}

export const usePlatforms = (): {
  platforms: PlatformRow[]
  isLoading: boolean
  isCreating: boolean
  updatingPlatformId: string | null
  deletingPlatformId: string | null
  create: (name: string) => void
  update: (id: string, name: string) => void
  remove: (id: string) => void
} => {
  const [platforms, setPlatforms] = useState<PlatformRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [updatingPlatformId, setUpdatingPlatformId] = useState<string | null>(null)
  const [deletingPlatformId, setDeletingPlatformId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      try {
        const loadedPlatforms = await platformsController.list()
        if (cancelled) return
        setPlatforms(sortPlatformsByName(loadedPlatforms))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const platformsById = useMemo(() => {
    const map = new Map<string, PlatformRow>()
    for (const platform of platforms) map.set(platform.id, platform)
    return map
  }, [platforms])

  const create = (name: string) => {
    const normalizedName = name.trim()
    const optimistic = buildOptimisticPlatform(normalizedName)
    setPlatforms((previousPlatforms) =>
      sortPlatformsByName([optimistic, ...previousPlatforms])
    )

    void (async () => {
      setIsCreating(true)
      try {
        const createdPlatform = await platformsController.create(normalizedName)

        setPlatforms((previousPlatforms) =>
          sortPlatformsByName(
            previousPlatforms.map((platform) =>
              platform.id === optimistic.id ? createdPlatform : platform
            )
          )
        )

        toast({
          title: "Plataforma criada",
          description: createdPlatform.name,
        })
      } catch (error) {
        setPlatforms((previousPlatforms) =>
          previousPlatforms.filter((platform) => platform.id !== optimistic.id)
        )

        toast({
          title: "Erro ao criar plataforma",
          description: error instanceof Error ? error.message : "Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsCreating(false)
      }
    })()
  }

  const update = (id: string, name: string) => {
    const currentPlatform = platformsById.get(id)
    if (!currentPlatform) return

    const normalizedName = name.trim()
    const optimistic: PlatformRow = { ...currentPlatform, name: normalizedName }
    setPlatforms((previousPlatforms) =>
      sortPlatformsByName(
        previousPlatforms.map((platform) => (platform.id === id ? optimistic : platform))
      )
    )

    void (async () => {
      setUpdatingPlatformId(id)
      try {
        const updatedPlatform = await platformsController.update(id, normalizedName)
        setPlatforms((previousPlatforms) =>
          sortPlatformsByName(
            previousPlatforms.map((platform) =>
              platform.id === id ? updatedPlatform : platform
            )
          )
        )
        toast({
          title: "Plataforma atualizada",
          description: updatedPlatform.name,
        })
      } catch (error) {
        setPlatforms((previousPlatforms) =>
          sortPlatformsByName(
            previousPlatforms.map((platform) =>
              platform.id === id ? currentPlatform : platform
            )
          )
        )
        toast({
          title: "Erro ao atualizar plataforma",
          description: error instanceof Error ? error.message : "Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setUpdatingPlatformId((current) => (current === id ? null : current))
      }
    })()
  }

  const remove = (id: string) => {
    const currentPlatform = platformsById.get(id)
    if (!currentPlatform) return

    setPlatforms((previousPlatforms) =>
      previousPlatforms.filter((platform) => platform.id !== id)
    )

    void (async () => {
      setDeletingPlatformId(id)
      try {
        await platformsController.remove(id)
        toast({
          title: "Plataforma excluída",
          description: currentPlatform.name,
        })
      } catch (error) {
        setPlatforms((previousPlatforms) =>
          sortPlatformsByName([currentPlatform, ...previousPlatforms])
        )
        toast({
          title: "Erro ao excluir plataforma",
          description: error instanceof Error ? error.message : "Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setDeletingPlatformId((current) => (current === id ? null : current))
      }
    })()
  }

  return {
    platforms,
    isLoading,
    isCreating,
    updatingPlatformId,
    deletingPlatformId,
    create,
    update,
    remove,
  }
}
