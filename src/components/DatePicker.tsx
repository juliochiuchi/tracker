import { Calendar as CalendarIcon, X } from "lucide-react"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, formatDate, parseISODate, toISODate } from "@/lib/utils"

export const DatePicker = ({
  value,
  onChange,
  placeholder = "Selecione uma data",
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}) => {
  const selected = parseISODate(value)
  const label = value ? formatDate(value) : placeholder

  const clear = () => onChange("")

  return (
    <Popover>
      <div className="relative w-full">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start pr-10 text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon size={16} aria-hidden />
            {label}
          </Button>
        </PopoverTrigger>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={clear}
            className="absolute top-1/2 right-2 -translate-y-1/2"
            disabled={disabled}
          >
            <X size={16} aria-hidden />
            <span className="sr-only">Limpar data</span>
          </Button>
        ) : null}
      </div>

      <PopoverContent portalled={false} className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected ?? undefined}
          onSelect={(d) => onChange(d ? toISODate(d) : "")}
          locale={ptBR}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
