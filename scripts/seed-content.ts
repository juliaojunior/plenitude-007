import { config } from "dotenv"
config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../src/lib/db/schema"
import { loadMana, loadMeditacoes } from "./lib/content"

const db = drizzle(neon(process.env.DATABASE_URL!), { schema })
const { manadiario, meditacoes } = schema

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
}
main().catch((e) => { console.error(e); process.exit(1) })
