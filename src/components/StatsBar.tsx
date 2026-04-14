import {
  CircleDollarSign,
  Clock,
  Package,
  PackageCheck,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export const StatsBar = ({
  total,
  pending,
  delivered,
  pendingValue,
}: {
  total: number
  pending: number
  delivered: number
  pendingValue: number
}) => {
  const cards = [
    { label: "Total", value: String(total), Icon: Package },
    { label: "Aguardando", value: String(pending), Icon: Clock },
    { label: "Entregues", value: String(delivered), Icon: PackageCheck },
    { label: "Valor pendente", value: formatCurrency(pendingValue), Icon: CircleDollarSign },
  ] as const

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map(({ label, value, Icon }) => (
        <Card key={label} size="sm">
          <CardContent className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="truncate text-base font-medium">{value}</div>
            </div>
            <Icon size={20} aria-hidden className="text-muted-foreground" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
