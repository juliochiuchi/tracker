import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Inbox, Pencil, Plus, Store, Trash2 } from "lucide-react"

import { ConfirmDialog } from "@/components/ConfirmDialog"
import { PlatformEditDialog } from "@/components/PlatformEditDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LoadingPanel } from "@/components/ui/loading"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Spinner } from "@/components/ui/loading"
import { usePlatforms } from "@/hooks/usePlatforms"

export const Route = createFileRoute("/_app/platforms")({
  component: PlatformsPage,
})

function PlatformsPage() {
  const { platforms, isLoading, isCreating, updatingPlatformId, deletingPlatformId, create, update, remove } = usePlatforms()

  const [newPlatformName, setNewPlatformName] = useState("")
  const [editingPlatformId, setEditingPlatformId] = useState<string | null>(null)
  const [deletePlatformId, setDeletePlatformId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const editingPlatform = useMemo(() => {
    if (!editingPlatformId) return null
    return platforms.find((platform) => platform.id === editingPlatformId) ?? null
  }, [platforms, editingPlatformId])

  const normalizedNewPlatformName = newPlatformName.trim()
  const canCreate =
    normalizedNewPlatformName.length > 0 && normalizedNewPlatformName.length <= 30

  const openDelete = (id: string) => {
    setDeletePlatformId(id)
    setDeleteOpen(true)
  }

  const deletePlatform = platforms.find((platform) => platform.id === deletePlatformId) ?? null
  const isDeleting = Boolean(deletePlatformId && deletingPlatformId === deletePlatformId)
  const deleteTitle = "Excluir plataforma?"
  const deleteDescription = deletePlatform
    ? `Antes de excluir, verifique se não existem produtos vinculados. Você vai excluir "${deletePlatform.name}".`
    : "Antes de excluir, verifique se não existem produtos vinculados."

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Store size={20} aria-hidden />
            <h1 className="text-lg font-semibold">Plataformas</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre, renomeie e remova plataformas usadas nos seus produtos.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Nova plataforma</CardTitle>
          <CardDescription>Nome único, com até 30 caracteres.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={newPlatformName}
              maxLength={30}
              placeholder="Ex.: Amazon"
              onChange={(event) => setNewPlatformName(event.target.value)}
              disabled={isCreating}
              onKeyDown={(event) => {
                if (event.key === "Enter" && canCreate && !isCreating) {
                  create(normalizedNewPlatformName)
                  setNewPlatformName("")
                }
              }}
            />
            <Button
              className="sm:self-stretch"
              disabled={!canCreate || isCreating}
              onClick={() => {
                create(normalizedNewPlatformName)
                setNewPlatformName("")
              }}
            >
              {isCreating ? <Spinner className="size-4" aria-hidden /> : <Plus size={18} aria-hidden />}
              {isCreating ? "Salvando..." : "Inserir"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>Plataformas cadastradas</span>
            <span className="text-sm font-normal text-muted-foreground">
              {platforms.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingPanel label="Carregando plataformas..." className="p-10" />
          ) : platforms.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border bg-muted/20 p-10 text-center">
              <Inbox size={28} aria-hidden className="text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                Nenhuma plataforma cadastrada ainda.
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-0 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platforms.map((platform) => (
                    <TableRow key={platform.id}>
                      <TableCell className="font-medium">{platform.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Editar ${platform.name}`}
                            onClick={() => setEditingPlatformId(platform.id)}
                          >
                            <Pencil size={16} aria-hidden />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Excluir ${platform.name}`}
                            onClick={() => openDelete(platform.id)}
                          >
                            <Trash2 size={16} aria-hidden />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {editingPlatform ? (
        <PlatformEditDialog
          open
          onOpenChange={(open) => {
            if (!open) setEditingPlatformId(null)
          }}
          initialName={editingPlatform.name}
          isSubmitting={updatingPlatformId === editingPlatform.id}
          onSubmit={(name) => {
            update(editingPlatform.id, name)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={deleteTitle}
        description={deleteDescription}
        confirmLabel={isDeleting ? "Excluindo..." : "Excluir"}
        cancelDisabled={isDeleting}
        confirmDisabled={isDeleting}
        onConfirm={() => {
          if (deletePlatformId) remove(deletePlatformId)
          setDeletePlatformId(null)
        }}
      />
    </div>
  )
}
