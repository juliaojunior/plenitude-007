import { config } from "dotenv"
config({ path: ".env.local" })
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { put } from "@vercel/blob"
import { loadMana, type ManaEntry } from "./lib/content"
import { tts, durationSeconds } from "./lib/tts"

const FILE = resolve(process.cwd(), "content/mana.json")
const VOICE_ID = "EIkHVdkuarjkYUyMnoes"
const MAX_ATTEMPTS = 3 // 1 tentativa + 2 retries

function buildRoteiroMana(m: ManaEntry): string {
  const frases = m.comentario.split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter(Boolean)
  const comentarioComPausas = frases.join(' <break time="0.6s" /> ')
  return `[slowly] ${m.textoBiblico} <break time="1.2s" /> [softly] ${m.referencia} <break time="1.5s" /> [gently] ${comentarioComPausas}`
}

function parseArgs() {
  const args = process.argv.slice(2)
  const limitIdx = args.indexOf("--limit")
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : undefined
  const onlyDate = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a))
  return { limit, onlyDate }
}

async function main() {
  const { limit, onlyDate } = parseArgs()
  const mana = loadMana()
  let pendentes = mana.filter((m) => !m.urlAudio)
  if (onlyDate) pendentes = pendentes.filter((m) => m.data === onlyDate)
  if (limit) pendentes = pendentes.slice(0, limit)

  if (pendentes.length === 0) {
    console.log("Nada pendente — todos os Manás selecionados já têm áudio.")
    return
  }

  let totalChars = 0
  const falhas: string[] = []

  for (const m of pendentes) {
    if (!m.roteiroAudio) {
      m.roteiroAudio = buildRoteiroMana(m)
      writeFileSync(FILE, JSON.stringify(mana, null, 2) + "\n")
    }
    totalChars += m.roteiroAudio.length
    console.log(`▶ mana-${m.data} (${m.roteiroAudio.length} chars) …`)

    let mp3: Buffer | null = null
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        mp3 = await tts(m.roteiroAudio, VOICE_ID)
        break
      } catch (e) {
        console.error(`  ✗ tentativa ${attempt}/${MAX_ATTEMPTS} falhou: ${(e as Error).message}`)
      }
    }
    if (!mp3) {
      console.error(`  ⨯ mana-${m.data}: desistindo após ${MAX_ATTEMPTS} tentativas`)
      falhas.push(m.data)
      continue
    }

    const dur = durationSeconds(mp3)
    const blob = await put(`audio/mana-${m.data}.mp3`, mp3, {
      access: "public",
      contentType: "audio/mpeg",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true,
    })
    m.urlAudio = blob.url
    m.duracaoSegundos = dur
    writeFileSync(FILE, JSON.stringify(mana, null, 2) + "\n")
    console.log(`  ✓ mana-${m.data}: ${dur}s → ${blob.url}`)
  }

  console.log(`\nConcluído: ${pendentes.length - falhas.length}/${pendentes.length} narrações geradas.`)
  console.log(`Caracteres enviados à API: ${totalChars}`)
  if (falhas.length) console.log(`Falharam: ${falhas.join(", ")}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
