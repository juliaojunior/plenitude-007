import { config } from "dotenv"
config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../src/lib/db/schema"
import { loadMana, loadMeditacoes, loadSons } from "./lib/content"

const db = drizzle(neon(process.env.DATABASE_URL!), { schema })
const { manadiario, meditacoes, sons } = schema

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

  const meds = loadMeditacoes()
  for (const m of meds) {
    await db.insert(meditacoes).values({
      id: m.id,
      titulo: m.titulo,
      categoria: m.categoria,
      urlAudio: m.urlAudio,
      textoBiblico: m.textoBiblico,
      referencia: m.referencia,
      transcricao: m.transcricao,
      duracaoSegundos: m.duracaoSegundos,
    }).onConflictDoUpdate({
      target: meditacoes.id,
      set: {
        titulo: m.titulo, categoria: m.categoria, urlAudio: m.urlAudio,
        textoBiblico: m.textoBiblico, referencia: m.referencia,
        transcricao: m.transcricao, duracaoSegundos: m.duracaoSegundos, updatedAt: new Date(),
      },
    })
  }
  console.log(`✓ Meditações: ${meds.length} upserts`)

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
    }).onConflictDoUpdate({
      target: sons.id,
      set: {
        titulo: s.titulo, urlAudio: s.urlAudio, duracaoSegundos: s.duracaoSegundos,
        imagem: s.imagem, cor: s.cor, descricao: s.descricao, updatedAt: new Date(),
      },
    })
  }
  console.log(`✓ Sons: ${somsList.length} upserts`)
}
main().catch((e) => { console.error(e); process.exit(1) })
