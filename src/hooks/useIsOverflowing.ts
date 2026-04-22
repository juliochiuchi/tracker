import { useCallback, useLayoutEffect, useRef, useState } from "react"

export const useIsOverflowing = <T extends HTMLElement>(dep?: unknown) => {
  const ref = useRef<T | null>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const next = el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
    setIsOverflowing(next)
  }, [])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const raf = requestAnimationFrame(measure)
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null
    ro?.observe(el)
    window.addEventListener("resize", measure)

    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [measure, dep])

  return { ref, isOverflowing, measure }
}

