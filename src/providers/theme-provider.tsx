import * as React from "react"
import { ThemeContext, type ThemeContextValue, type Theme } from "./theme-context"

const STORAGE_KEY = "tracker:theme"

function getSystemTheme(): Exclude<Theme, "system"> {
  if (typeof window === "undefined") return "light"
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyThemeClass(resolved: Exclude<Theme, "system">) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.classList.toggle("dark", resolved === "dark")
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system"
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === "light" || stored === "dark" || stored === "system") return stored
  return "system"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(() => readStoredTheme())
  const [resolvedTheme, setResolvedTheme] = React.useState<Exclude<Theme, "system">>(() =>
    theme === "system" ? getSystemTheme() : theme,
  )

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next)
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const toggleTheme = React.useCallback(() => {
    setThemeState((prev) => {
      const currentResolved = prev === "system" ? getSystemTheme() : prev
      const next = currentResolved === "dark" ? "light" : "dark"
      if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  React.useEffect(() => {
    const nextResolved = theme === "system" ? getSystemTheme() : theme
    setResolvedTheme(nextResolved)
    applyThemeClass(nextResolved)
  }, [theme])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const media = window.matchMedia?.("(prefers-color-scheme: dark)")
    if (!media) return

    const onChange = () => {
      if (theme !== "system") return
      const nextResolved = getSystemTheme()
      setResolvedTheme(nextResolved)
      applyThemeClass(nextResolved)
    }

    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [theme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
