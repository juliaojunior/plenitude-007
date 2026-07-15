import { config } from "dotenv"
config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../src/lib/db/schema"
import { loadMana, loadMeditacoes, loadSons, loadSeries, loadSerieItens } from "./lib/content"

const db = drizzle(neon(process.env.DATABASE_URL!), { schema })
const { manadiario, meditacoes, sons, series } = schema

type MeditacaoRow = {
  id: string
  titulo: string
  categoria: string | null
  serieId: string | null
  urlAudio: string | null
  textoBiblico: string | null
  referencia: string | null
  transcricao: string | null
  duracaoSegundos: number | null
}

async function main() {
  const mana = loadMana()
  for (const m of mana) {
    await db.insert(manadiario).values({
      id: `mana-${m.data}`,
      data: m.data,
      textoBiblico: m.textoBiblico,
      referencia: m.referencia,
      comentario: m.comentario,
    }).onConflictDoUpdate({
      target: manadiario.data,
      set: { textoBiblico: m.textoBiblico, referencia: m.referencia, comentario: m.comentario, updatedAt: new Date() },
    })
  }
  console.log(`✓ Maná: ${mana.length} upserts`)

  const medsFromCategorias: MeditacaoRow[] = loadMeditacoes().map((m) => ({
    id: m.id, titulo: m.titulo, categoria: m.categoria, serieId: null,
    urlAudio: m.urlAudio, textoBiblico: m.textoBiblico, referencia: m.referencia,
    transcricao: m.transcricao, duracaoSegundos: m.duracaoSegundos,
  }))
  const medsFromSeries: MeditacaoRow[] = loadSerieItens().map((m) => ({
    id: m.id, titulo: m.titulo, categoria: null, serieId: m.serieId,
    urlAudio: m.urlAudio, textoBiblico: m.textoBiblico ?? null, referencia: m.referencia ?? null,
    transcricao: m.transcricao ?? null, duracaoSegundos: m.duracaoSegundos,
  }))
  const allMeds = [...medsFromCategorias, ...medsFromSeries]

  for (const m of allMeds) {
    await db.insert(meditacoes).values({
      id: m.id, titulo: m.titulo, categoria: m.categoria, serieId: m.serieId,
      urlAudio: m.urlAudio, textoBiblico: m.textoBiblico, referencia: m.referencia,
      transcricao: m.transcricao, duracaoSegundos: m.duracaoSegundos,
    }).onConflictDoUpdate({
      target: meditacoes.id,
      set: {
        titulo: m.titulo, categoria: m.categoria, serieId: m.serieId, urlAudio: m.urlAudio,
        textoBiblico: m.textoBiblico, referencia: m.referencia,
        transcricao: m.transcricao, duracaoSegundos: m.duracaoSegundos, updatedAt: new Date(),
      },
    })
  }
  console.log(`✓ Meditações: ${allMeds.length} upserts (${medsFromCategorias.length} por categoria, ${medsFromSeries.length} de séries)`)

  const somsList = loadSons()
  for (const s of somsList) {
    await db.insert(sons).values({
      id: s.id,
      titulo: s.titulo,
      urlAudio: s.urlAudio,
      duracaoSegundos: s.duracaoSegundos,
      imagem: s.imagem,
      cor: s.cor,
      descricao: s.descricao,
      tipo: s.tipo ?? null,
    }).onConflictDoUpdate({
      target: sons.id,
      set: {
        titulo: s.titulo, urlAudio: s.urlAudio, duracaoSegundos: s.duracaoSegundos,
        imagem: s.imagem, cor: s.cor, descricao: s.descricao, tipo: s.tipo ?? null, updatedAt: new Date(),
      },
    })
  }
  console.log(`✓ Sons: ${somsList.length} upserts`)

  const seriesList = loadSeries()
  for (const s of seriesList) {
    await db.insert(series).values({
      id: s.id,
      titulo: s.titulo,
      imagem: s.imagem ?? null,
      cor: s.cor ?? null,
      descricao: s.descricao ?? null,
      ativa: s.ativa ?? true,
    }).onConflictDoUpdate({
      target: series.id,
      set: {
        titulo: s.titulo, imagem: s.imagem ?? null, cor: s.cor ?? null, descricao: s.descricao ?? null,
        ativa: s.ativa ?? true,
      },
    })
  }
  console.log(`✓ Séries: ${seriesList.length} upserts`)
}
main().catch((e) => { console.error(e); process.exit(1) })
