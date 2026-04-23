import * as React from "react"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<typeof Loader2>) {
  return <Loader2 className={cn("animate-spin", className)} {...props} />
}

function LoadingPanel({
  label = "Carregando...",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 rounded-xl border bg-muted/20 px-4 py-8 text-sm text-muted-foreground",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner className="size-4" aria-hidden />
      <span>{label}</span>
    </div>
  )
}

export { Spinner, LoadingPanel }

