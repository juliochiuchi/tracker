export interface ResponseDataSeuRastreio {
  codigo: string
  eventoMaisRecente: ItemSeuRastreioMaisRecente
  linkDetalhesCompletos: string
  message: string
  status: string
  success: boolean
}

export interface ItemSeuRastreioMaisRecente {
  codigo: string
  data: string
  descricao: string
  detalhe: string
  local: string
}
