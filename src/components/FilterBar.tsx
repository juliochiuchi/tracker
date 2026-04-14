import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import type { StatusFilter } from "@/lib/constants"

const ALL_YEARS_VALUE = "__all_years__"

export interface FilterBarProps {
  filter: StatusFilter
  onFilter: (v: StatusFilter) => void
  search: string
  onSearch: (v: string) => void
  yearFilter: string
  onYear: (v: string) => void
  availableYears: string[]
  hasActiveFilters: boolean
  onReset: () => void
}

export const FilterBar = ({
  filter,
  onFilter,
  search,
  onSearch,
  yearFilter,
  onYear,
  availableYears,
  hasActiveFilters,
  onReset,
}: FilterBarProps) => {
  const pills: Array<{ key: StatusFilter; label: string }> = [
    { key: "all", label: "Todos" },
    { key: "pending", label: "Aguardando" },
    { key: "delivered", label: "Entregues" },
  ]

  const selectYearValue = yearFilter === "" ? ALL_YEARS_VALUE : yearFilter

  const handleYear = (v: string) => {
    onYear(v === ALL_YEARS_VALUE ? "" : v)
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex items-center gap-2">
          {pills.map((p) => {
            const active = p.key === filter
            return (
              <Button
                key={p.key}
                type="button"
                variant={active ? "secondary" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => onFilter(p.key)}
              >
                {p.label}
              </Button>
            )
          })}
        </div>

        <div className="grid gap-1">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search
              size={16}
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-8"
              placeholder="Nome do item"
            />
          </div>
        </div>

        <div className="grid gap-1">
          <Label>Ano do prazo</Label>
          <Select value={selectYearValue} onValueChange={handleYear}>
            <SelectTrigger className="w-full md:w-52">
              <SelectValue placeholder="Todos os anos" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Ano do prazo</SelectLabel>
                <SelectItem value={ALL_YEARS_VALUE}>Todos os anos</SelectItem>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          <X size={16} aria-hidden />
          Limpar filtros
        </Button>
      )}
    </div>
  )
}
