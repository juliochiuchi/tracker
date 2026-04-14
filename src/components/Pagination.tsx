import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export const Pagination = ({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (page: number) => void
}) => {
  const canPrev = page > 1
  const canNext = page < totalPages

  const goPrev = () => {
    if (canPrev) onPage(page - 1)
  }

  const goNext = () => {
    if (canNext) onPage(page + 1)
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <Button variant="outline" size="sm" onClick={goPrev} disabled={!canPrev}>
        <ChevronLeft size={16} aria-hidden />
        Anterior
      </Button>
      <div className="text-sm text-muted-foreground">
        Página <span className="text-foreground">{page}</span> de{" "}
        <span className="text-foreground">{totalPages}</span>
      </div>
      <Button variant="outline" size="sm" onClick={goNext} disabled={!canNext}>
        Próxima
        <ChevronRight size={16} aria-hidden />
      </Button>
    </div>
  )
}
