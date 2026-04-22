import * as React from "react"

export type ToastVariant = "default" | "destructive"

export type ToastOptions = {
  title?: string
  description?: string
  variant?: ToastVariant
  durationMs?: number
}

type ToastState = ToastOptions & { id: string; open: boolean }

let listeners: Array<(toasts: ToastState[]) => void> = []
let memoryState: ToastState[] = []

const notify = () => {
  for (const l of listeners) l(memoryState)
}

const genId = () =>
  globalThis.crypto?.randomUUID?.() ?? `t_${Math.random().toString(16).slice(2)}`

export const toast = (opts: ToastOptions) => {
  const id = genId()
  const durationMs = opts.durationMs ?? 3500

  const next: ToastState = {
    id,
    open: true,
    variant: opts.variant ?? "default",
    title: opts.title,
    description: opts.description,
    durationMs,
  }

  memoryState = [next, ...memoryState].slice(0, 5)
  notify()

  window.setTimeout(() => {
    dismissToast(id)
  }, durationMs)

  return {
    id,
    dismiss: () => dismissToast(id),
  }
}

export const dismissToast = (id?: string) => {
  if (!id) {
    memoryState = memoryState.map((t) => ({ ...t, open: false }))
    notify()
    return
  }
  memoryState = memoryState.map((t) => (t.id === id ? { ...t, open: false } : t))
  notify()
}

export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastState[]>(() => memoryState)

  React.useEffect(() => {
    const l = (next: ToastState[]) => setToasts(next)
    listeners = [...listeners, l]
    return () => {
      listeners = listeners.filter((x) => x !== l)
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    memoryState = memoryState.filter((t) => t.id !== id)
    notify()
  }, [])

  return { toasts, removeToast }
}

