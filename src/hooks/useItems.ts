import { useEffect, useMemo, useState } from "react"

import { itemsController } from "@/controllers/itemsController"
import { platformsController } from "@/controllers/platformsController"
import { STORAGE_KEYS } from "@/lib/constants"
import type { ItemFormData } from "@/lib/schema"
import { storage } from "@/lib/storage"
import { getDeadlineYear } from "@/lib/utils"
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
  add: (data: ItemFormData) => void
  toggleDelivered: (id: string) => void
} => {
  const [items, setItems] = useState<Item[]>(() => {
    return storage.getJSON<Item[]>(STORAGE_KEYS.items) ?? []
  })
  const [platforms, setPlatforms] = useState<PlatformRow[]>([])
  const [deadlineYears, setDeadlineYears] = useState<string[]>([])

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
      const platformsRes = await platformsController.list().catch(() => [])
      const itemsRes = await itemsController.list().catch(() => [])
      if (cancelled) return
      setPlatforms(platformsRes)
      setDeadlineYears(buildDeadlineYears(itemsRes))

      const mapped: Item[] = itemsRes.map((r) => ({
        id: r.id,
        name: r.name,
        value: r.price,
        platform: toPlatformName(r.platform, platformsRes),
        tracking: r.tracking_code ?? "",
        deadline: r.delivery_time ?? "",
        delivered: r.delivered,
        createdAt: r.created_at,
      }))
      setItems(mapped)
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
      } catch {
        setItems((prev) => prev.filter((it) => it.id !== optimistic.id))
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

    void (async () => {
      try {
        await itemsController.setDelivered(id, nextDelivered)
      } catch {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, delivered: !nextDelivered } : i))
        )
      }
    })()
  }

  return { items, platforms, deadlineYears, add, toggleDelivered }
}
