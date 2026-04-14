import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Inbox, Package, Plus } from "lucide-react"

import { FilterBar } from "@/components/FilterBar"
import { ItemCard } from "@/components/ItemCard"
import { ItemForm } from "@/components/ItemForm"
import { Pagination } from "@/components/Pagination"
import { StatsBar } from "@/components/StatsBar"
import { Button } from "@/components/ui/button"
import { ITEMS_PER_PAGE, type StatusFilter } from "@/lib/constants"
import type { ItemFormData } from "@/lib/schema"
import { getDeadlineYear, normalizeText } from "@/lib/utils"
import { useItems } from "@/hooks/useItems"

export const Route = createFileRoute('/_app/')({
  component: Index,
})

function Index() {
  const { items, platforms, deadlineYears, add, toggleDelivered } = useItems()

  const [filter, setFilter] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = normalizeText(search)
    return items.filter((i) => {
      const matchStatus =
        filter === "all" ||
        (filter === "pending" ? !i.delivered : i.delivered)
      const matchName = !q || normalizeText(i.name).includes(q)
      const matchYear = !yearFilter || getDeadlineYear(i.deadline) === yearFilter
      return matchStatus && matchName && matchYear
    })
  }, [items, filter, search, yearFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, safePage])

  const stats = useMemo(() => {
    const total = items.length
    const pending = items.filter((i) => !i.delivered).length
    const delivered = items.filter((i) => i.delivered).length
    const pendingValue = items
      .filter((i) => !i.delivered)
      .reduce((acc, i) => acc + i.value, 0)
    return { total, pending, delivered, pendingValue }
  }, [items])

  const hasActiveFilters = filter !== "all" || search !== "" || yearFilter !== ""

  const onFilter = (v: StatusFilter) => {
    setFilter(v)
    setPage(1)
  }

  const onSearch = (v: string) => {
    setSearch(v)
    setPage(1)
  }

  const onYear = (v: string) => {
    setYearFilter(v)
    setPage(1)
  }

  const onReset = () => {
    setFilter("all")
    setSearch("")
    setYearFilter("")
    setPage(1)
  }

  const emptyText = (() => {
    const hasQuery = search.trim() !== ""
    const hasYear = yearFilter !== ""

    if (hasQuery || hasYear) return "Nenhum item encontrado com os filtros atuais."

    if (filter === "pending") return "Nenhuma encomenda aguardando entrega."
    if (filter === "delivered") return "Nenhuma encomenda entregue ainda."
    return "Cadastre sua primeira encomenda para começar."
  })()

  const handleSubmitItem = (data: ItemFormData) => {
    add(data)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Package size={20} aria-hidden />
            <h1 className="text-lg font-semibold">Package Tracker</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie suas encomendas e marque entregas direto no card.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={20} aria-hidden />
          Adicionar
        </Button>
      </header>

      <StatsBar
        total={stats.total}
        pending={stats.pending}
        delivered={stats.delivered}
        pendingValue={stats.pendingValue}
      />

      <FilterBar
        filter={filter}
        onFilter={onFilter}
        search={search}
        onSearch={onSearch}
        yearFilter={yearFilter}
        onYear={onYear}
        availableYears={deadlineYears}
        hasActiveFilters={hasActiveFilters}
        onReset={onReset}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border bg-muted/20 p-10 text-center">
          <Inbox size={28} aria-hidden className="text-muted-foreground" />
          <div className="text-sm text-muted-foreground">{emptyText}</div>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {paged.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onToggleDelivered={toggleDelivered}
            />
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
      ) : null}

      <ItemForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmitItem={handleSubmitItem}
        platforms={platforms}
        onAdded={() => setPage(1)}
      />
    </div>
  )
}
