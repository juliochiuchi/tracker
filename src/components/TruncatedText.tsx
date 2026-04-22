import { useIsOverflowing } from "@/hooks/useIsOverflowing"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export interface TruncatedTextProps {
  text: string
  maxChars?: number
  className?: string
  tooltipSide?: "top" | "right" | "bottom" | "left"
}

function truncateWithEllipsis(text: string, maxChars: number) {
  if (maxChars <= 0) return ""
  if (text.length <= maxChars) return text
  if (maxChars === 1) return "…"
  return `${text.slice(0, maxChars - 1)}…`
}

export const TruncatedText = ({
  text,
  maxChars,
  className,
  tooltipSide = "top",
}: TruncatedTextProps) => {
  const { ref } = useIsOverflowing<HTMLSpanElement>(text)
  const hasCharLimit = typeof maxChars === "number"
  const displayText = hasCharLimit ? truncateWithEllipsis(text, maxChars) : text

  const content = (
    <span className={cn("min-w-0", className)}>
      <span ref={ref} className="block truncate">
        {displayText}
      </span>
    </span>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side={tooltipSide} align="start">
        {text}
      </TooltipContent>
    </Tooltip>
  )
}
