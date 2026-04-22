import type * as React from "react"

import { cn } from "@/lib/utils"

export interface AppShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export const AppShell = ({ sidebar, children, className, contentClassName }: AppShellProps) => {
  return (
    <div
      className={cn(
        "min-h-svh bg-background text-foreground md:grid md:grid-cols-[15rem_1fr]",
        className,
      )}
    >
      <div className="md:sticky md:top-0 md:h-svh">{sidebar}</div>
      <main className={cn("min-w-0", contentClassName)}>{children}</main>
    </div>
  )
}
