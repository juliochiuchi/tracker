import type { ResponseDataSeuRastreio } from "@/types/seuSastreio"
import { seuRastreioHttp } from "@/services/seuRastreioHttp"

export const seuRastreioService = {
  async getSingleTracking(tracking: string): Promise<ResponseDataSeuRastreio> {
    const resTrackingRoute = await seuRastreioHttp.get(`/rastreio/${tracking}`)
    const data = resTrackingRoute.data as ResponseDataSeuRastreio

    return data ?? {}
  },
}
