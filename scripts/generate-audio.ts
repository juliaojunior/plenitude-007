import { config } from "dotenv"
config({ path: ".env.local" })
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { put } from "@vercel/blob"
import { loadMeditacoes } from "./lib/content"

const VOICE = process.env.ELEVENLABS_VOICE_ID!
const MODEL = process.env.ELEVENLABS_MODEL ?? "eleven_v3"
const FILE = resolve(process.cwd(), "content/meditacoes.json")
const CHUNK_LIMIT = 4800
const onlyId = process.argv[2]

/** Split into <=CHUNK_LIMIT pieces at paragraph, then sentence boundaries. */
function chunk(text: string): string[] {
  if (text.length <= CHUNK_LIMIT) return [text]
  const out: string[] = []
  let cur = ""
  const push = (s: string) => { if (s.trim()) out.push(s.trim()) }
  for (const para of text.split(/\n\n+/)) {
    if (para.length > CHUNK_LIMIT) {
      if (cur) { push(cur); cur = "" }
      let s = ""
      for (const sent of para.split(/(?<=[.!?…])\s+/)) {
        if ((s + " " + sent).length > CHUNK_LIMIT) { push(s); s = sent }
        else { s = s ? s + " " + sent : sent }
      }
      if (s) cur = s
    } else if ((cur + "\n\n" + para).length > CHUNK_LIMIT) {
      push(cur); cur = para
    } else {
      cur = cur ? cur + "\n\n" + para : para
    }
  }
  push(cur)
  return out
}

async function ttsOne(text: string): Promise<Buffer> {
  const body: Record<string, unknown> = { text, model_id: MODEL }
  if (MODEL !== "eleven_v3") {
    body.voice_settings = { stability: 0.6, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true }
  }
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return Buffer.from(await res.arrayBuffer())
}

async function tts(text: string): Promise<Buffer> {
  const parts = chunk(text)
  if (parts.length === 1) return ttsOne(parts[0])
  const bufs: Buffer[] = []
  for (let i = 0; i < parts.length; i++) {
    console.log(`    · bloco ${i + 1}/${parts.length} (${parts[i].length} chars)`)
    bufs.push(await ttsOne(parts[i]))
  }
  return Buffer.concat(bufs)
}

const durationSeconds = (mp3: Buffer) => Math.round((mp3.length * 8) / 128000) // 128 kbps CBR

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
