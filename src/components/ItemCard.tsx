import {
  CircleDollarSign,
  Clock,
  Package,
  PackageCheck,
  Pencil,
  ScanBarcode,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react"
import { useEffect, useState } from "react"

import { TruncatedText } from "@/components/TruncatedText"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { cn, daysUntil, formatCurrency, formatDate, fromNow } from "@/lib/utils"
import type { Item } from "@/types/item"
import { seuRastreioController } from "@/controllers/seuRastreio"

const getDeadlineBadge = (
  delivered: boolean,
  deadline: string
): { text: string; className: string } => {
  if (delivered) {
    return { text: "Entregue", className: "bg-green-500/10 text-green-700" }
  }

  const d = deadline ? daysUntil(deadline) : null
  if (d === null) {
    return { text: "Sem prazo", className: "bg-muted text-foreground" }
  }
  if (d < 0) {
    return { text: "Atrasado", className: "bg-red-500/10 text-red-700" }
  }
  if (d <= 3) {
    return { text: `Em ${d}d`, className: "bg-amber-500/15 text-amber-800" }
  }
  return { text: `Em ${d}d`, className: "bg-blue-500/10 text-blue-700" }
}

export const ItemCard = ({
  item,
  onToggleDelivered,
  onEdit,
  onDelete,
}: {
  item: Item
  onToggleDelivered: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) => {
  const borderClass = item.delivered
    ? "border-l-4 border-l-green-500"
    : "border-l-4 border-l-amber-400"

  const deadlineText = formatDate(item.deadline ? item.deadline : null)
  const createdText = fromNow(item.createdAt)
  const valueText = formatCurrency(item.value)
  const badge = getDeadlineBadge(item.delivered, item.deadline)

  const tracking = item.tracking?.trim()
  const [lastRouteTrackingResult, setLastRouteTrackingResult] = useState<{
    tracking: string
    text: string
  } | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!tracking) return

    seuRastreioController.getLastEventDescription(tracking).then((text) => {
      if (cancelled) return
      setLastRouteTrackingResult({ tracking, text })
    })

    return () => {
      cancelled = true
    }
  }, [tracking])

  const lastRouteTrackingText = !tracking
    ? "Sem informações de rastreio"
    : lastRouteTrackingResult?.tracking === tracking
      ? lastRouteTrackingResult.text
      : "Carregando..."

  return (
    <Card className={cn(borderClass, "h-full")}>
      <CardHeader className="gap-2">
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1">
          <div className="min-w-0 overflow-hidden">
            <CardTitle className="min-w-0">
              <TruncatedText text={item.name} maxChars={19} />
            </CardTitle>
          </div>

          <Badge className={cn("shrink-0 justify-self-end whitespace-nowrap", badge.className)}>
            {badge.text}
          </Badge>

          <div className="flex flex-col items-start justify-start gap-1">
            <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
              <Package size={16} aria-hidden />
              <span className="whitespace-nowrap">Adicionado {createdText}</span>
            </div>

            <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
              <Truck size={16} aria-hidden />
              <span className="truncate">
                {lastRouteTrackingText}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <ShoppingBag size={16} aria-hidden className="text-muted-foreground" />
              <span className="truncate">{item.platform}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <CircleDollarSign
                size={16}
                aria-hidden
                className="text-muted-foreground"
              />
              <span className="whitespace-nowrap">{valueText}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} aria-hidden />
              <span>Prazo</span>
            </div>
            <span className="whitespace-nowrap">{deadlineText}</span>
          </div>

          {tracking ? (
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ScanBarcode size={16} aria-hidden />
                <span>Rastreio</span>
              </div>
              <span className="max-w-[60%] truncate font-mono">{tracking}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-auto grid gap-2">
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2 text-sm">
                {item.delivered ? (
                  <PackageCheck size={20} aria-hidden className="text-green-600" />
                ) : (
                  <Package size={20} aria-hidden className="text-muted-foreground" />
                )}
                <span className="truncate font-medium">Entregue</span>
              </div>
              <Switch
                checked={item.delivered}
                onCheckedChange={() => onToggleDelivered(item.id)}
              />
            </div>

            <div className="shrink-0 rounded-full border bg-muted/20 p-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer"
                onClick={() => onEdit(item.id)}
                aria-label="Editar"
              >
                <Pencil size={16} aria-hidden />
              </Button>
            </div>

            <div className="shrink-0 rounded-full border bg-muted/20 p-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer text-destructive hover:text-destructive"
                onClick={() => onDelete(item.id)}
                aria-label="Excluir"
              >
                <Trash2 size={16} aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
