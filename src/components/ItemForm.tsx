import { zodResolver } from "@hookform/resolvers/zod"
import {
  CircleDollarSign,
  Clock,
  Package,
  ScanBarcode,
  ShoppingBag,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import type { z } from "zod"

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/DatePicker"
import { itemSchema, type ItemFormData } from "@/lib/schema"
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/utils"
import type { PlatformRow } from "@/types/db/platform"

type ItemFormInput = z.input<typeof itemSchema>

export const ItemForm = ({
  open,
  onOpenChange,
  mode,
  initialValues,
  onSubmitItem,
  platforms,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  initialValues?: Partial<ItemFormInput>
  onSubmitItem: (data: ItemFormData) => void
  platforms: PlatformRow[]
  onSuccess?: () => void
}) => {
  const defaultValues = useMemo<ItemFormInput>(
    () => ({
      name: "",
      value: 0,
      platform: "",
      tracking: "",
      deadline: "",
      delivered: false,
      ...initialValues,
    }),
    [initialValues]
  )

  const form = useForm<ItemFormInput>({
    resolver: zodResolver(itemSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(defaultValues)
  }, [open, mode, form, defaultValues])

  const submit = async (values: ItemFormInput) => {
    const parsed = itemSchema.parse(values)
    await onSubmitItem(parsed)
    form.reset()
    onOpenChange(false)
    onSuccess?.()
  }

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form

  const isEdit = mode === "edit"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar encomenda" : "Adicionar encomenda"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados da compra e mantenha seu histórico organizado."
              : "Cadastre uma compra e acompanhe o prazo e o status de entrega."}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
          <div className="grid gap-1">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Package size={14} aria-hidden />
              Nome
            </Label>
            <Input id="name" {...register("name")} />
            {errors.name?.message ? (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="value" className="flex items-center gap-2">
              <CircleDollarSign size={14} aria-hidden />
              Valor
            </Label>
            <Controller
              control={control}
              name="value"
              render={({ field }) => {
                const numberValue =
                  typeof field.value === "number" && Number.isFinite(field.value)
                    ? field.value
                    : 0
                const displayValue =
                  numberValue > 0 ? formatCurrencyInput(numberValue) : ""

                return (
                  <Input
                    id="value"
                    inputMode="numeric"
                    value={displayValue}
                    onChange={(e) => {
                      field.onChange(parseCurrencyInput(e.target.value))
                    }}
                    placeholder="0,00"
                  />
                )
              }}
            />
            {errors.value?.message ? (
              <p className="text-destructive text-xs">{errors.value.message}</p>
            ) : null}
          </div>

          <div className="grid gap-1">
            <Label className="flex items-center gap-2">
              <ShoppingBag size={14} aria-hidden />
              Plataforma
            </Label>
            <Controller
              control={control}
              name="platform"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Plataformas</SelectLabel>
                      {platforms.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.platform?.message ? (
              <p className="text-destructive text-xs">
                {errors.platform.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="tracking" className="flex items-center gap-2">
              <ScanBarcode size={14} aria-hidden />
              Rastreio
            </Label>
            <Input placeholder="SD123456789BR" id="tracking" {...register("tracking")} />
            {errors.tracking?.message ? (
              <p className="text-destructive text-xs">
                {errors.tracking.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="deadline" className="flex items-center gap-2">
              <Clock size={14} aria-hidden />
              Prazo
            </Label>
            <Controller
              control={control}
              name="deadline"
              render={({ field }) => (
                <DatePicker
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Selecione o prazo"
                />
              )}
            />
            {errors.deadline?.message ? (
              <p className="text-destructive text-xs">
                {errors.deadline.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
            <Label className="flex items-center gap-2">
              <Package size={14} aria-hidden />
              Entregue
            </Label>
            <Controller
              control={control}
              name="delivered"
              render={({ field }) => (
                <Switch
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{isEdit ? "Salvar" : "Adicionar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
