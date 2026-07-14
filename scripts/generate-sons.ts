import { config } from "dotenv"
config({ path: ".env.local" })
import { writeFileSync, unlinkSync } from "node:fs"
import { resolve } from "node:path"
import { tmpdir } from "node:os"
import { spawnSync } from "node:child_process"
import { put } from "@vercel/blob"
import { loadSons } from "./lib/content"

const KEY = process.env.ELEVENLABS_API_KEY!
const FILE = resolve(process.cwd(), "content/sons.json")
const CROSSFADE_SEC = 2.5
const SR = 44100
const CHANNELS = 2
const BYTES_PER_FRAME = 2 * CHANNELS // int16 stereo
// ponytail: sound-generation API caps duration_seconds at 30 (task asked ~30-45s); harmless since it loops anyway
const MAX_SFX_SECONDS = 30

type Tipo = "ambiente" | "musica"
interface Item {
  id: string
  titulo: string
  tipo: Tipo
  prompt: string
  cor: string
  imagem: string | null
  descricao: string
  durationSecEffect?: number
  lengthMs?: number
}

const ITEMS: Item[] = [
  {
    id: "som-chuva", titulo: "Chuva Suave", tipo: "ambiente", cor: "#3D5A80", imagem: "/categorias/sono.webp",
    descricao: "Chuva suave e contínua, ideal para relaxar ou dormir.",
    prompt: "gentle steady rain falling continuously, soft and calming, no thunder, seamless ambient texture",
    durationSecEffect: MAX_SFX_SECONDS,
  },
  {
    id: "som-ondas-mar", titulo: "Ondas do Mar", tipo: "ambiente", cor: "#2E6F7E", imagem: "/categorias/paz.webp",
    descricao: "Ondas calmas quebrando na praia, ritmo lento e sereno.",
    prompt: "calm ocean waves gently rolling onto a sandy beach, slow steady rhythm, peaceful and soothing",
    durationSecEffect: MAX_SFX_SECONDS,
  },
  {
    id: "som-floresta-amanhecer", titulo: "Floresta ao Amanhecer", tipo: "ambiente", cor: "#4E7C59", imagem: "/categorias/esperanca.webp",
    descricao: "Floresta tranquila ao amanhecer, com pássaros ao longe.",
    prompt: "quiet forest at dawn, distant birdsong, soft breeze through leaves, calm morning atmosphere",
    durationSecEffect: MAX_SFX_SECONDS,
  },
  {
    id: "som-riacho-suave", titulo: "Riacho Suave", tipo: "ambiente", cor: "#3D8296", imagem: "/categorias/foco.webp",
    descricao: "Riacho manso sobre pedras lisas, água borbulhante e contínua.",
    prompt: "gentle stream flowing over smooth stones, soft bubbling water, calm and continuous",
    durationSecEffect: MAX_SFX_SECONDS,
  },
  {
    id: "som-brisa-noturna", titulo: "Brisa Noturna", tipo: "ambiente", cor: "#1F2A4A", imagem: "/categorias/sono.webp",
    descricao: "Brisa noturna suave e minimalista, ideal para dormir.",
    prompt: "soft night breeze, minimal ambient texture, quiet and calming, ideal for sleep",
    durationSecEffect: MAX_SFX_SECONDS,
  },
  {
    id: "som-sinos-cristal", titulo: "Sinos de Cristal", tipo: "ambiente", cor: "#8B5E9E", imagem: "/categorias/sabedoria.webp",
    descricao: "Tigela de cristal, toques lentos e ressonantes, tons meditativos.",
    prompt: "crystal singing bowl, slow resonant strikes, peaceful meditative tones, long decay",
    durationSecEffect: MAX_SFX_SECONDS,
  },
  {
    id: "som-piano-suave", titulo: "Piano Suave", tipo: "musica", cor: "#6B5B95", imagem: "/categorias/paz.webp",
    descricao: "Melodia instrumental de piano, lenta e meditativa, sem vocais.",
    prompt: "slow gentle instrumental piano melody, meditative and calm, no vocals, spacious and warm",
    lengthMs: 165_000,
  },
  {
    id: "som-cordas-ambiente", titulo: "Cordas Ambiente", tipo: "musica", cor: "#4A6670", imagem: "/categorias/sabedoria.webp",
    descricao: "Pad de cordas sustentadas, textura ambiente quente para meditação.",
    prompt: "sustained ambient string pad, warm and spacious synthesizer texture, meditative background music, no percussion",
    lengthMs: 165_000,
  },
]

async function generateSoundEffect(text: string, durationSeconds: number): Promise<Buffer> {
  const res = await fetch("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128", {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text, duration_seconds: durationSeconds, prompt_influence: 0.3, loop: true }),
  })
  if (!res.ok) throw new Error(`SoundFX ${res.status}: ${(await res.text()).slice(0, 300)}`)
  return Buffer.from(await res.arrayBuffer())
}

async function generateMusic(prompt: string, musicLengthMs: number): Promise<Buffer> {
  const res = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, music_length_ms: musicLengthMs, model_id: "music_v2" }),
  })
  if (!res.ok) throw new Error(`Music ${res.status}: ${(await res.text()).slice(0, 300)}`)
  return Buffer.from(await res.arrayBuffer())
}

function decodeMp3ToPcm(mp3: Buffer): Buffer {
  const r = spawnSync("ffmpeg", ["-i", "pipe:0", "-f", "s16le", "-ar", String(SR), "-ac", String(CHANNELS), "pipe:1"], {
    input: mp3, maxBuffer: 1024 * 1024 * 200,
  })
  if (r.status !== 0) throw new Error(`ffmpeg decode falhou: ${r.stderr?.toString().slice(0, 500)}`)
  return r.stdout
}

function encodePcmToMp3(pcm: Buffer): Buffer {
  const r = spawnSync("ffmpeg", [
    "-f", "s16le", "-ar", String(SR), "-ac", String(CHANNELS), "-i", "pipe:0",
    "-codec:a", "libmp3lame", "-q:a", "2", "-f", "mp3", "pipe:1",
  ], { input: pcm, maxBuffer: 1024 * 1024 * 200 })
  if (r.status !== 0) throw new Error(`ffmpeg encode falhou: ${r.stderr?.toString().slice(0, 500)}`)
  return r.stdout
}

/** Equal-power crossfade (g_out² + g_in² = 1) of the tail into the head, so the file loops without a click. */
function crossfadeLoop(pcm: Buffer, crossfadeSec: number): Buffer {
  const totalFrames = Math.floor(pcm.length / BYTES_PER_FRAME)
  const xfadeFrames = Math.round(SR * crossfadeSec)
  if (xfadeFrames * 2 >= totalFrames) throw new Error("áudio curto demais para a janela de crossfade")
  const outFrames = totalFrames - xfadeFrames
  const out = Buffer.alloc(outFrames * BYTES_PER_FRAME)
  for (let i = 0; i < outFrames; i++) {
    const srcOff = i * BYTES_PER_FRAME
    if (i < xfadeFrames) {
      const theta = (i / xfadeFrames) * (Math.PI / 2)
      const gIn = Math.sin(theta)
      const gOut = Math.cos(theta)
      const tailOff = (totalFrames - xfadeFrames + i) * BYTES_PER_FRAME
      for (let c = 0; c < CHANNELS; c++) {
        const a = pcm.readInt16LE(srcOff + c * 2)
        const b = pcm.readInt16LE(tailOff + c * 2)
        const mixed = Math.round(a * gIn + b * gOut)
        out.writeInt16LE(Math.max(-32768, Math.min(32767, mixed)), i * BYTES_PER_FRAME + c * 2)
      }
    } else {
      pcm.copy(out, i * BYTES_PER_FRAME, srcOff, srcOff + BYTES_PER_FRAME)
    }
  }
  return out
}

function makeSeamlessLoop(mp3: Buffer): Buffer {
  return encodePcmToMp3(crossfadeLoop(decodeMp3ToPcm(mp3), CROSSFADE_SEC))
}

function durationSeconds(mp3: Buffer): number {
  // ffprobe can't read duration from a piped mp3 stream (no seek) — needs a real file
  const tmp = resolve(tmpdir(), `sons-dur-${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`)
  writeFileSync(tmp, mp3)
  try {
    const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", tmp])
    return Math.round(parseFloat(r.stdout.toString().trim()))
  } finally {
    unlinkSync(tmp)
  }
}

async function main() {
  const sons = loadSons()
  const falhas: string[] = []
  for (const item of ITEMS) {
    console.log(`▶ ${item.titulo} (${item.tipo}) …`)
    let raw: Buffer
    try {
      raw = item.tipo === "ambiente"
        ? await generateSoundEffect(item.prompt, item.durationSecEffect!)
        : await generateMusic(item.prompt, item.lengthMs!)
    } catch (e) {
      console.error(`  ✗ geração falhou: ${(e as Error).message}`)
      falhas.push(`${item.id}: ${(e as Error).message}`)
      continue
    }
    const looped = makeSeamlessLoop(raw)
    const dur = durationSeconds(looped)
    const blob = await put(`audio/${item.id}.mp3`, looped, {
      access: "public", contentType: "audio/mpeg", token: process.env.BLOB_READ_WRITE_TOKEN, allowOverwrite: true,
    })
    const entry = {
      id: item.id, titulo: item.titulo, urlAudio: blob.url, duracaoSegundos: dur,
      imagem: item.imagem, cor: item.cor, descricao: item.descricao, tipo: item.tipo,
    }
    const existing = sons.find((s) => s.id === item.id)
    if (existing) Object.assign(existing, entry)
    else sons.push(entry)
    writeFileSync(FILE, JSON.stringify(sons, null, 2) + "\n")
    console.log(`  ✓ ${item.id}: ${dur}s → ${blob.url}`)
  }
  if (falhas.length) {
    console.log("\nPendentes por falha/cota:")
    for (const f of falhas) console.log(`  - ${f}`)
  }
  console.log("Concluído.")
}
main().catch((e) => { console.error(e); process.exit(1) })
