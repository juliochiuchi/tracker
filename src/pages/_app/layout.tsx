import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Package, Store } from "lucide-react"

import { AppShell } from "@/components/AppShell"
import { AppSidebar } from "@/components/AppSidebar"
import { ThemeToggle } from "@/components/ThemeToggle"

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <AppShell
      sidebar={
        <AppSidebar
          title="Package Tracker"
          items={[
            { label: "Encomendas", to: "/", icon: Package },
            { label: "Plataformas", to: "/platforms", icon: Store },
          ]}
          footer={<ThemeToggle />}
        />
      }
    >
      <Outlet />
    </AppShell>
  )
}
