import { seuRastreioService } from "@/services/seuRastreioService"
import type { ResponseDataSeuRastreio } from "@/types/seuSastreio"

const EMPTY_TRACKING_TEXT = "Sem informações de rastreio"
const CACHE_TTL_MS = 5 * 60 * 1000

const lastEventTextCache = new Map<string, { text: string; expiresAt: number }>()
const inFlightLastEventText = new Map<string, Promise<string>>()

export const seuRastreioController = {
  getSingleTracking: (tracking: string): Promise<ResponseDataSeuRastreio> => seuRastreioService.getSingleTracking(tracking),
  getLastEventDescription: (tracking?: string | null): Promise<string> => {
    const normalized = tracking?.trim()
    if (!normalized || normalized === "N/A") return Promise.resolve(EMPTY_TRACKING_TEXT)

    const cached = lastEventTextCache.get(normalized)
    const now = Date.now()
    if (cached && cached.expiresAt > now) return Promise.resolve(cached.text)

    const inFlight = inFlightLastEventText.get(normalized)
    if (inFlight) return inFlight

    const promise = (async () => {
      try {
        const data = await seuRastreioService.getSingleTracking(normalized)
        const text = data.eventoMaisRecente?.descricao || EMPTY_TRACKING_TEXT
        lastEventTextCache.set(normalized, { text, expiresAt: Date.now() + CACHE_TTL_MS })
        return text
      } catch {
        lastEventTextCache.set(normalized, { text: EMPTY_TRACKING_TEXT, expiresAt: Date.now() + CACHE_TTL_MS })
        return EMPTY_TRACKING_TEXT
      } finally {
        inFlightLastEventText.delete(normalized)
      }
    })()

    inFlightLastEventText.set(normalized, promise)
    return promise
  },
}
