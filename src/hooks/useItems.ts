import { useEffect, useMemo, useState } from "react"

import { itemsController } from "@/controllers/itemsController"
import { platformsController } from "@/controllers/platformsController"
import { STORAGE_KEYS } from "@/lib/constants"
import type { ItemFormData } from "@/lib/schema"
import { storage } from "@/lib/storage"
import { getDeadlineYear } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import type { ItemsPurchasedRow } from "@/types/db/itemsPurchased"
import type { PlatformRow } from "@/types/db/platform"
import type { Item } from "@/types/item"

const toPlatformName = (platformId: string, platforms: PlatformRow[]): string =>
  platforms.find((p) => p.id === platformId)?.name ?? platformId

const mapFormToOptimisticItem = (
  data: ItemFormData,
  platforms: PlatformRow[]
): Item => {
  const now = new Date().toISOString()
  const tempId =
    globalThis.crypto?.randomUUID?.() ?? `tmp_${Math.random().toString(16).slice(2)}`

  return {
    id: tempId,
    name: data.name,
    value: data.value,
    platform: toPlatformName(data.platform, platforms),
    tracking: data.tracking ?? "",
    deadline: data.deadline ?? "",
    delivered: data.delivered ?? false,
    createdAt: now,
  }
}

const buildDeadlineYears = (rows: Array<Pick<ItemsPurchasedRow, "delivery_time">>): string[] =>
  [...new Set(rows.map((r) => getDeadlineYear(r.delivery_time)).filter((y): y is string => Boolean(y)))]
    .sort()
    .reverse()

export const useItems = (): {
  items: Item[]
  platforms: PlatformRow[]
  deadlineYears: string[]
  isLoading: boolean
  add: (data: ItemFormData) => void
  update: (id: string, data: ItemFormData) => void
  toggleDelivered: (id: string) => void
  remove: (id: string) => void
} => {
  const [items, setItems] = useState<Item[]>(() => {
    return storage.getJSON<Item[]>(STORAGE_KEYS.items) ?? []
  })
  const [platforms, setPlatforms] = useState<PlatformRow[]>([])
  const [deadlineYears, setDeadlineYears] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const platformsById = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of platforms) map.set(p.id, p.name)
    return map
  }, [platforms])

  useEffect(() => {
    storage.setJSON(STORAGE_KEYS.items, items)
  }, [items])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      try {
        const [loadedPlatforms, loadedItems] = await Promise.all([
          platformsController.list().catch(() => []),
          itemsController.list().catch(() => []),
        ])

        if (cancelled) return
        setPlatforms(loadedPlatforms)
        setDeadlineYears(buildDeadlineYears(loadedItems))

        const mapped: Item[] = loadedItems.map((row) => ({
          id: row.id,
          name: row.name,
          value: row.price,
          platform: toPlatformName(row.platform, loadedPlatforms),
          tracking: row.tracking_code ?? "",
          deadline: row.delivery_time ?? "",
          delivered: row.delivered,
          createdAt: row.created_at,
        }))
        setItems(mapped)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const add = (data: ItemFormData) => {
    const optimistic = mapFormToOptimisticItem(data, platforms)
    setItems((prev) => [optimistic, ...prev])

    const platformId = data.platform
    void (async () => {
      try {
        const created = await itemsController.create({
          name: data.name,
          price: data.value,
          platform: platformId,
          tracking_code: data.tracking?.trim() ? data.tracking.trim() : null,
          delivery_time: data.deadline?.trim() ? data.deadline.trim() : null,
          delivered: data.delivered ?? false,
        })

        const platformName = platformsById.get(created.platform) ?? created.platform

        setItems((prev) =>
          prev.map((it) =>
            it.id === optimistic.id
              ? {
                ...it,
                id: created.id,
                platform: platformName,
                createdAt: created.created_at,
              }
              : it
          )
        )

        const createdYear = getDeadlineYear(created.delivery_time)
        if (createdYear) {
          setDeadlineYears((prev) =>
            prev.includes(createdYear) ? prev : [...prev, createdYear].sort().reverse()
          )
        }

        toast({
          title: "Encomenda criada",
          description: created.name,
        })
      } catch {
        setItems((prev) => prev.filter((it) => it.id !== optimistic.id))
        toast({
          title: "Erro ao criar encomenda",
          description: "Tente novamente.",
          variant: "destructive",
        })
      }
    })()
  }

  const update = (id: string, data: ItemFormData) => {
    const current = items.find((i) => i.id === id)
    if (!current) return

    const platformName = platformsById.get(data.platform) ?? data.platform
    const tracking = data.tracking?.trim() ?? ""
    const deadline = data.deadline?.trim() ?? ""
    const delivered = data.delivered ?? false

    const optimistic: Item = {
      ...current,
      name: data.name,
      value: data.value,
      platform: platformName,
      tracking,
      deadline,
      delivered,
    }

    setItems((prev) => prev.map((it) => (it.id === id ? optimistic : it)))

    void (async () => {
      try {
        const updated = await itemsController.update(id, {
          name: data.name,
          price: data.value,
          platform: data.platform,
          tracking_code: tracking ? tracking : null,
          delivery_time: deadline ? deadline : null,
          delivered,
        })

        const updatedPlatformName =
          platformsById.get(updated.platform) ?? updated.platform

        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? {
                ...it,
                name: updated.name,
                value: updated.price,
                platform: updatedPlatformName,
                tracking: updated.tracking_code ?? "",
                deadline: updated.delivery_time ?? "",
                delivered: updated.delivered,
              }
              : it
          )
        )

        const updatedYear = getDeadlineYear(updated.delivery_time)
        if (updatedYear) {
          setDeadlineYears((prev) =>
            prev.includes(updatedYear) ? prev : [...prev, updatedYear].sort().reverse()
          )
        }

        toast({
          title: "Encomenda atualizada",
          description: updated.name,
        })
      } catch {
        setItems((prev) => prev.map((it) => (it.id === id ? current : it)))
        toast({
          title: "Erro ao atualizar encomenda",
          description: "Tente novamente.",
          variant: "destructive",
        })
      }
    })()
  }

  const toggleDelivered = (id: string) => {
    const current = items.find((i) => i.id === id)
    if (!current) return

    const nextDelivered = !current.delivered
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, delivered: nextDelivered } : i))
    )

    toast({
      title: nextDelivered ? "Marcado como entregue" : "Marcado como pendente",
      description: current.name,
    })

    void (async () => {
      try {
        await itemsController.setDelivered(id, nextDelivered)
      } catch {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, delivered: !nextDelivered } : i))
        )

        toast({
          title: "Erro ao atualizar status",
          description: "Tente novamente.",
          variant: "destructive",
        })
      }
    })()
  }

  const remove = (id: string) => {
    const prev = items
    setItems((cur) => cur.filter((it) => it.id !== id))

    void (async () => {
      try {
        await itemsController.remove(id)
        toast({
          title: "Encomenda excluída",
        })
      } catch {
        setItems(prev)
        toast({
          title: "Erro ao excluir encomenda",
          description: "Tente novamente.",
          variant: "destructive",
        })
      }
    })()
  }

  return {
    items,
    platforms,
    deadlineYears,
    isLoading,
    add,
    update,
    toggleDelivered,
    remove,
  }
}
