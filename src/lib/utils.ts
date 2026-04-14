import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)
dayjs.locale("pt-br")

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value
  )

export const formatDecimal = (value: number, decimals = 2): string =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)

export const formatPercent = (value: number, decimals = 1): string =>
  `${formatDecimal(value * 100, decimals)}%`

export const formatDate = (date: string | null | undefined): string =>
  date ? dayjs(date).format("DD/MM/YYYY") : "—"

export const formatDateLong = (date: string): string =>
  dayjs(date).format("ddd, D [de] MMM[.]")

export const daysUntil = (date: string | null | undefined): number | null =>
  date
    ? dayjs(date).startOf("day").diff(dayjs().startOf("day"), "day")
    : null

export const fromNow = (date: string): string => dayjs(date).fromNow()

export const normalizeText = (str: string): string =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()

export const getDeadlineYear = (deadline: string | null | undefined): string | null =>
  deadline?.split("-")[0] ?? null

export const toISODate = (date: Date): string => dayjs(date).format("YYYY-MM-DD")

export const parseISODate = (date: string | null | undefined): Date | null => {
  if (!date) return null
  const d = dayjs(date)
  return d.isValid() ? d.toDate() : null
}

export const parseCurrencyInput = (raw: string): number => {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return 0
  const cents = Number(digits)
  if (!Number.isFinite(cents)) return 0
  return cents / 100
}

export const formatCurrencyInput = (value: number): string =>
  formatDecimal(value, 2)
