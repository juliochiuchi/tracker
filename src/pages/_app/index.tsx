import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Inbox, Package, Plus } from "lucide-react"

import { ConfirmDialog } from "@/components/ConfirmDialog"
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
  const { items, platforms, deadlineYears, add, update, toggleDelivered, remove } = useItems()

  const [filter, setFilter] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

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
    const totalSpent = items.reduce((acc, i) => acc + i.value, 0)
    return { total, pending, delivered, pendingValue, totalSpent }
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
    if (formMode === "create") {
      add(data)
      return
    }
    if (editingId) {
      update(editingId, data)
    }
  }

  const editingItem = useMemo(() => {
    if (!editingId) return null
    return items.find((i) => i.id === editingId) ?? null
  }, [items, editingId])

  const editInitialValues = useMemo(() => {
    if (!editingItem) return undefined
    const platformId =
      platforms.find((p) => p.name === editingItem.platform)?.id ??
      platforms.find((p) => p.id === editingItem.platform)?.id ??
      editingItem.platform

    return {
      name: editingItem.name,
      value: editingItem.value,
      platform: platformId ?? "",
      tracking: editingItem.tracking,
      deadline: editingItem.deadline,
      delivered: editingItem.delivered,
    }
  }, [editingItem, platforms])

  const handleOpenCreate = () => {
    setFormMode("create")
    setEditingId(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (id: string) => {
    setFormMode("edit")
    setEditingId(id)
    setDialogOpen(true)
  }

  const handleDeleteRequest = (id: string) => {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  const deleteItem = items.find((i) => i.id === deleteId) ?? null
  const deleteTitle = "Excluir encomenda?"
  const deleteDescription = deleteItem
    ? `Esta ação não pode ser desfeita. Você vai excluir "${deleteItem.name}".`
    : "Esta ação não pode ser desfeita."

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-4">
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
        <Button onClick={handleOpenCreate}>
          <Plus size={20} aria-hidden />
          Adicionar
        </Button>
      </header>

      <StatsBar
        total={stats.total}
        pending={stats.pending}
        delivered={stats.delivered}
        pendingValue={stats.pendingValue}
        totalSpent={stats.totalSpent}
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
        <div className="grid items-stretch gap-3 md:grid-cols-2 lg:grid-cols-3">
          {paged.map((item) => (
            <div key={item.id} className="h-full">
              <ItemCard
                item={item}
                onToggleDelivered={toggleDelivered}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteRequest}
              />
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
      ) : null}

      <ItemForm
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingId(null)
            setFormMode("create")
          }
        }}
        mode={formMode}
        initialValues={formMode === "edit" ? editInitialValues : undefined}
        onSubmitItem={handleSubmitItem}
        platforms={platforms}
        onSuccess={() => {
          if (formMode === "create") setPage(1)
          setEditingId(null)
          setFormMode("create")
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={deleteTitle}
        description={deleteDescription}
        confirmLabel="Excluir"
        onConfirm={() => {
          if (deleteId) remove(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
