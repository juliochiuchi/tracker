export const ITEMS_PER_PAGE = 6

export const STORAGE_KEYS = {
  items: "pkg_items",
} as const

export type StatusFilter = "all" | "pending" | "delivered"
