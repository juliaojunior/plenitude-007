import { config } from "dotenv"
config({ path: ".env.local" })
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { put } from "@vercel/blob"
import { loadMeditacoes } from "./lib/content"
import { tts, durationSeconds } from "./lib/tts"

const FILE = resolve(process.cwd(), "content/meditacoes.json")
const onlyId = process.argv[2]

async function main() {
  const meds = loadMeditacoes()
  for (const m of meds) {
    if (onlyId && m.id !== onlyId) continue
    if (m.urlAudio && !onlyId) { console.log(`· pulando ${m.id} (já tem áudio)`); continue }
    console.log(`▶ ${m.id} (${(m.roteiroAudio || "").length} chars) …`)
    const mp3 = await tts(m.roteiroAudio)
    const dur = durationSeconds(mp3)
    const blob = await put(`audio/${m.id}.mp3`, mp3, { access: "public", contentType: "audio/mpeg", token: process.env.BLOB_READ_WRITE_TOKEN, allowOverwrite: true })
    m.urlAudio = blob.url
    m.duracaoSegundos = dur
    writeFileSync(FILE, JSON.stringify(meds, null, 2) + "\n")
    console.log(`  ✓ ${m.id}: ${dur}s → ${blob.url}`)
  }
  console.log("Concluído.")
}
main().catch((e) => { console.error(e); process.exit(1) })
