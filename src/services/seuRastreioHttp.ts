import axios from "axios"

const seuRastreioUrl = import.meta.env.VITE_SEU_RASTREIO_API_URL_PUBLIC
const seuRastreioKey = import.meta.env.VITE_SEUS_RASTREIO_API_KEY

export const seuRastreioHttp = axios.create({
  baseURL: `${seuRastreioUrl}`,
  headers: {
    Authorization: `Bearer ${seuRastreioKey}`,
  },
})
