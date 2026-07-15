import { config } from "dotenv"
config({ path: ".env.local" })
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { put } from "@vercel/blob"
import { loadSerieItens } from "./lib/content"
import { tts, durationSeconds } from "./lib/tts"

const FILE = resolve(process.cwd(), "content/series-itens.json")
const INACTIVE_SERIES = new Set(["serie-compaixao", "serie-primeiros-passos"])
const MAX_ATTEMPTS = 3 // 1 tentativa + 2 retries

async function main() {
  const itens = loadSerieItens()
  const alvo = itens.filter((it) => !INACTIVE_SERIES.has(it.serieId) && it.roteiroAudio)
  const falhas: string[] = []

  for (const it of alvo) {
    console.log(`▶ ${it.id} (${it.roteiroAudio!.length} chars) …`)
    let mp3: Buffer | null = null
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        mp3 = await tts(it.roteiroAudio!)
        break
      } catch (e) {
        console.error(`  ✗ tentativa ${attempt}/${MAX_ATTEMPTS} falhou: ${(e as Error).message}`)
      }
    }
    if (!mp3) {
      console.error(`  ⨯ ${it.id}: desistindo após ${MAX_ATTEMPTS} tentativas`)
      falhas.push(it.id)
      continue
    }
    const dur = durationSeconds(mp3)
    const blob = await put(`audio/${it.id}.mp3`, mp3, { access: "public", contentType: "audio/mpeg", token: process.env.BLOB_READ_WRITE_TOKEN, allowOverwrite: true })
    it.urlAudio = blob.url
    it.duracaoSegundos = dur
    writeFileSync(FILE, JSON.stringify(itens, null, 2) + "\n")
    console.log(`  ✓ ${it.id}: ${dur}s → ${blob.url}`)
  }

  console.log(`\nConcluído: ${alvo.length - falhas.length}/${alvo.length} narrações geradas.`)
  if (falhas.length) console.log(`Falharam: ${falhas.join(", ")}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
