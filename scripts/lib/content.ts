import { readFileSync } from "node:fs"
import { resolve } from "node:path"

export const CATEGORIA_SLUGS = [
  "ansiedade", "agradecer", "paz", "sabedoria",
  "sono", "foco", "perdao", "esperanca", "cura",
] as const
export type CategoriaSlug = (typeof CATEGORIA_SLUGS)[number]

export const MANA_START_DATE = "2026-06-27"
export const MANA_COUNT = 60

export interface ManaEntry {
  data: string
  referencia: string
  textoBiblico: string
  comentario: string
}

export interface MeditacaoEntry {
  id: string
  titulo: string
  categoria: CategoriaSlug
  referencia: string
  textoBiblico: string
  transcricao: string
  roteiroAudio: string
  duracaoSegundos: number | null
  urlAudio: string | null
}

const root = resolve(process.cwd(), "content")

export function loadMana(): ManaEntry[] {
  return JSON.parse(readFileSync(resolve(root, "mana.json"), "utf8"))
}
export function loadMeditacoes(): MeditacaoEntry[] {
  return JSON.parse(readFileSync(resolve(root, "meditacoes.json"), "utf8"))
}

export function expectedManaDates(): string[] {
  const out: string[] = []
  const start = new Date(`${MANA_START_DATE}T00:00:00Z`)
  for (let i = 0; i < MANA_COUNT; i++) {
    const d = new Date(start)
    d.setUTCDate(start.getUTCDate() + i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}
