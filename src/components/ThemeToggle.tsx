import { Moon, Sun } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/providers/theme-context"

export interface ThemeToggleProps {
  label?: string
}

export const ThemeToggle = ({ label = "Tema escuro" }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme()
  const checked = resolvedTheme === "dark"

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {checked ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}
        <span className="truncate text-sm">{label}</span>
      </div>
      <Switch
        aria-label={label}
        checked={checked}
        onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
      />
    </div>
  )
}

