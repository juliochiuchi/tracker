import { z } from "zod"

export const itemSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  value: z.coerce.number().min(0, "Valor inválido"),
  platform: z.string().min(1, "Selecione a plataforma"),
  tracking: z.string().optional(),
  deadline: z.string().optional(),
  delivered: z.boolean().default(false),
})

export type ItemFormData = z.infer<typeof itemSchema>
