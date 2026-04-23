import { useCallback, useLayoutEffect, useRef, useState } from "react"

export const useIsOverflowing = <T extends HTMLElement>(dependency?: unknown) => {
  const ref = useRef<T | null>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  const measureOverflow = useCallback(() => {
    const element = ref.current
    if (!element) return
    const nextIsOverflowing =
      element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight
    setIsOverflowing(nextIsOverflowing)
  }, [])

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const animationFrameId = requestAnimationFrame(measureOverflow)
    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measureOverflow) : null
    resizeObserver?.observe(element)
    window.addEventListener("resize", measureOverflow)

    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver?.disconnect()
      window.removeEventListener("resize", measureOverflow)
    }
  }, [measureOverflow, dependency])

  return { ref, isOverflowing, measure: measureOverflow }
}
