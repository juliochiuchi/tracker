import type * as React from "react"
import type { LucideIcon } from "lucide-react"
import { Link, useRouterState } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type AppSidebarItem = {
  label: string
  to: string
  icon?: LucideIcon
}

export interface AppSidebarProps {
  title?: string
  items: AppSidebarItem[]
  footer?: React.ReactNode
  className?: string
}

function normalizePath(path: string) {
  const stripped = path.replace(/\/+$/, "")
  return stripped === "" ? "/" : stripped
}

export const AppSidebar = ({ title = "Tracker", items, footer, className }: AppSidebarProps) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <aside
      className={cn(
        "flex h-full flex-col gap-4 border-b border-sidebar-border bg-sidebar px-3 py-4 text-sidebar-foreground md:border-b-0 md:border-r",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight">{title}</div>
          <div className="truncate text-xs text-muted-foreground">Organize suas encomendas</div>
        </div>
      </div>

      <nav className="grid gap-1">
        {items.map((item) => {
          const active = normalizePath(pathname) === normalizePath(item.to)
          const Icon = item.icon

          return (
            <Button
              key={item.to}
              asChild
              variant="ghost"
              className={cn(
                "h-9 w-full justify-start gap-2 rounded-xl px-2.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active && "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <Link to={item.to}>
                {Icon ? <Icon size={16} aria-hidden /> : null}
                <span className="truncate">{item.label}</span>
              </Link>
            </Button>
          )
        })}
      </nav>

      <div className="mt-auto grid gap-3 px-2">{footer}</div>
    </aside>
  )
}

