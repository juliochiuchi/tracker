import { useMemo, useState } from "react"
import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/loading"

export interface PlatformEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialName: string
  isSubmitting?: boolean
  onSubmit: (name: string) => void
}

export const PlatformEditDialog = ({
  open,
  onOpenChange,
  initialName,
  isSubmitting = false,
  onSubmit,
}: PlatformEditDialogProps) => {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState<string | null>(null)

  const initialNameNormalized = initialName.trim()
  const normalizedName = name.trim()

  const submitState = useMemo(() => {
    if (normalizedName.length === 0) {
      return { canSubmit: false, error: "Informe o nome da plataforma." }
    }
    if (normalizedName.length > 30) {
      return {
        canSubmit: false,
        error: "O nome da plataforma deve ter no máximo 30 caracteres.",
      }
    }
    if (normalizedName === initialNameNormalized) {
      return { canSubmit: false, error: null }
    }
    return { canSubmit: true, error: null }
  }, [normalizedName, initialNameNormalized])

  const submit = () => {
    if (!submitState.canSubmit) {
      setError(submitState.error)
      return
    }

    onSubmit(normalizedName)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil size={16} aria-hidden />
            Editar plataforma
          </DialogTitle>
          <DialogDescription>Renomeie a plataforma cadastrada.</DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <div className="grid gap-1">
            <Label htmlFor="platform_name">Nome</Label>
            <Input
              id="platform_name"
              value={name}
              maxLength={30}
              disabled={isSubmitting}
              onChange={(event) => {
                setName(event.target.value)
                setError(null)
              }}
              placeholder="Ex.: Amazon"
              autoFocus
            />
            {error ? <p className="text-destructive text-xs">{error}</p> : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!submitState.canSubmit || isSubmitting}>
              {isSubmitting ? <Spinner className="size-4" aria-hidden /> : null}
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
