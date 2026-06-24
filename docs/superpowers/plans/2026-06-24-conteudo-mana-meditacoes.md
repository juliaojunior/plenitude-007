# Conteúdo: Maná Diário + Meditações — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Popular o app Refúgio com 60 dias de Maná Diário e 18 meditações (2 por categoria), incluindo áudios narrados via ElevenLabs hospedados no Vercel Blob.

**Architecture:** Conteúdo vive em arquivos JSON versionados (`content/*.json`). Três scripts Node/TS (`tsx`) consomem esses arquivos: `validate-content` (checagem de schema/regras), `generate-audio` (ElevenLabs → Vercel Blob → grava url+duração de volta no JSON) e `seed-content` (upsert idempotente no Neon via Drizzle). Produção dos textos é colaborativa (Claude escreve a partir de temas aprovados; usuário adapta textos bíblicos).

**Tech Stack:** Next.js 16, Drizzle + Neon (neon-http), TypeScript via `tsx`, `@vercel/blob`, ElevenLabs REST API (`fetch`), `music-metadata` (duração), `dotenv` (.env.local).

## Global Constraints

- Tradução base **NVI**; os `textoBiblico` são **adaptados/parafraseados pelo usuário** antes do áudio (direitos autorais). Scripts não inventam versículos.
- Tom **cristão acolhedor, não-denominacional**.
- Maná: **60 entradas**, datas **diárias sequenciais a partir de 2026-06-27** (até 2026-08-25), `data` única no formato `YYYY-MM-DD`.
- Meditações: **18**, exatamente **2 por categoria**; categorias válidas (slugs): `ansiedade, agradecer, paz, sabedoria, sono, foco, perdao, esperanca, cura`.
- Ids determinísticos: meditação `med-<categoria>-<n>` (n=1,2); maná `mana-<data>`. Re-rodar scripts = upsert, nunca duplica.
- Duração-alvo por categoria: ansiedade ~4min, agradecer ~4min, paz ~5min, sabedoria ~6min, foco ~3min, perdao ~6min, esperanca ~5min, cura ~6min, sono ~10min. Ritmo ~110–130 wpm.
- Não modificar o schema do banco. Não construir UI de upload no /admin (fora de escopo).

---

### Task 1: Tooling e schema de conteúdo + validador

**Files:**
- Modify: `package.json` (devDeps + scripts)
- Create: `scripts/lib/content.ts` (tipos + constantes + carregadores)
- Create: `scripts/validate-content.ts`
- Create: `content/mana.json` (array vazio `[]` por enquanto)
- Create: `content/meditacoes.json` (array vazio `[]` por enquanto)

**Interfaces:**
- Produces: `ManaEntry`, `MeditacaoEntry` types; `loadMana()`, `loadMeditacoes()`, `CATEGORIA_SLUGS`, `MANA_START_DATE`, `expectedManaDates()`; um executável `npm run content:validate` que sai com código ≠0 em falha.

- [ ] **Step 1: Instalar dependências**

Run:
```bash
npm install -D tsx music-metadata && npm install @vercel/blob
```
Expected: instala sem erro; `package.json` passa a listar `tsx`, `music-metadata` (devDeps) e `@vercel/blob` (deps).

- [ ] **Step 2: Adicionar scripts ao package.json**

Adicionar em `"scripts"`:
```json
"content:validate": "tsx scripts/validate-content.ts",
"content:audio": "tsx scripts/generate-audio.ts",
"content:seed": "tsx scripts/seed-content.ts"
```

- [ ] **Step 3: Criar `scripts/lib/content.ts`**

```ts
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
  data: string          // YYYY-MM-DD
  referencia: string
  textoBiblico: string
  comentario: string
}

export interface MeditacaoEntry {
  id: string            // med-<categoria>-<n>
  titulo: string
  categoria: CategoriaSlug
  referencia: string
  textoBiblico: string
  transcricao: string
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

/** 60 datas diárias a partir de MANA_START_DATE (UTC), formato YYYY-MM-DD. */
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
```

- [ ] **Step 4: Criar `content/mana.json` e `content/meditacoes.json`**

Ambos com conteúdo inicial:
```json
[]
```

- [ ] **Step 5: Criar `scripts/validate-content.ts`**

```ts
import {
  loadMana, loadMeditacoes, expectedManaDates,
  CATEGORIA_SLUGS, MANA_COUNT,
} from "./lib/content"

const errors: string[] = []
const wc = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

// ── Maná ──
const mana = loadMana()
if (mana.length !== MANA_COUNT) errors.push(`Maná: esperado ${MANA_COUNT}, achou ${mana.length}`)
const expected = expectedManaDates()
mana.forEach((m, i) => {
  if (m.data !== expected[i]) errors.push(`Maná[${i}]: data ${m.data} ≠ esperada ${expected[i]}`)
  if (!m.referencia?.trim()) errors.push(`Maná[${i}] (${m.data}): referencia vazia`)
  if (!m.textoBiblico?.trim()) errors.push(`Maná[${i}] (${m.data}): textoBiblico vazio`)
  const n = wc(m.comentario ?? "")
  if (n < 100 || n > 300) errors.push(`Maná[${i}] (${m.data}): comentario com ${n} palavras (esperado 100–300)`)
})

// ── Meditações ──
const meds = loadMeditacoes()
if (meds.length !== 18) errors.push(`Meditações: esperado 18, achou ${meds.length}`)
const porCategoria = new Map<string, number>()
const ids = new Set<string>()
for (const m of meds) {
  if (!CATEGORIA_SLUGS.includes(m.categoria as never)) errors.push(`Meditação ${m.id}: categoria inválida "${m.categoria}"`)
  porCategoria.set(m.categoria, (porCategoria.get(m.categoria) ?? 0) + 1)
  if (ids.has(m.id)) errors.push(`Meditação: id duplicado "${m.id}"`)
  ids.add(m.id)
  for (const f of ["titulo", "referencia", "textoBiblico", "transcricao"] as const) {
    if (!m[f]?.trim()) errors.push(`Meditação ${m.id}: ${f} vazio`)
  }
}
for (const slug of CATEGORIA_SLUGS) {
  const c = porCategoria.get(slug) ?? 0
  if (c !== 2) errors.push(`Categoria "${slug}": ${c} meditações (esperado 2)`)
}

if (errors.length) {
  console.error(`❌ ${errors.length} problema(s):\n` + errors.map((e) => " - " + e).join("\n"))
  process.exit(1)
}
console.log(`✅ Conteúdo válido: ${mana.length} maná, ${meds.length} meditações.`)
```

- [ ] **Step 6: Rodar o validador (deve falhar — arrays vazios)**

Run: `npm run content:validate`
Expected: FAIL (exit 1) com mensagens "Maná: esperado 60, achou 0" e "Meditações: esperado 18, achou 0". Isso confirma que o validador funciona.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json scripts/lib/content.ts scripts/validate-content.ts content/mana.json content/meditacoes.json
git commit -m "Add content tooling: schema, loaders and validator"
```

---

### Task 2: Calendário temático (esqueleto) + aprovação do usuário

**Files:**
- Modify: `content/mana.json` (60 itens só com `data`, `referencia` e tema-rascunho)
- Modify: `content/meditacoes.json` (18 itens com `id`, `titulo`, `categoria`, `referencia`)
- Create: `content/CALENDARIO.md` (visão legível para o usuário aprovar)

**Interfaces:**
- Consumes: tipos/datas da Task 1.
- Produces: esqueleto preenchível; lista de temas aprovada.

- [ ] **Step 1: Gerar o calendário do Maná (60 dias)**

Preencher `content/mana.json` com 60 objetos, cada um com `data` (de `expectedManaDates()`), `referencia` (versículo NVI escolhido) e um `comentario` contendo **apenas o tema em uma linha** (placeholder a expandir na Task 3) e `textoBiblico: ""`. Distribuir temas girando entre os 9 eixos do app + datas marcantes, em blocos semanais coerentes (ex.: semana de Confiança/Ansiedade, semana de Gratidão, etc.). Sem repetir versículo.

- [ ] **Step 2: Gerar os 18 títulos de meditação**

Preencher `content/meditacoes.json` com 18 objetos: `id` = `med-<categoria>-1|2`, `titulo`, `categoria`, `referencia` (NVI), e `textoBiblico: ""`, `transcricao: ""`, `duracaoSegundos: null`, `urlAudio: null`. Dois títulos distintos por categoria, alinhados ao tema da categoria.

- [ ] **Step 3: Escrever `content/CALENDARIO.md`**

Tabela legível: para o Maná, colunas Data | Tema | Referência (60 linhas); para Meditações, Categoria | Título | Referência | Duração-alvo (18 linhas).

- [ ] **Step 4: Validar a estrutura (datas/contagens/categorias)**

Ajustar o validador para tolerar texto vazio nesta fase **não** é necessário; em vez disso rode uma checagem de estrutura:
Run: `tsx -e "import('./scripts/lib/content.ts').then(async m=>{const mana=m.loadMana();const meds=m.loadMeditacoes();const exp=m.expectedManaDates();console.log('maná',mana.length, mana.every((x,i)=>x.data===exp[i]));const cat=new Map();meds.forEach(x=>cat.set(x.categoria,(cat.get(x.categoria)||0)+1));console.log('meds',meds.length,[...cat.entries()]);})"`
Expected: `maná 60 true` e `meds 18` com cada categoria = 2.

- [ ] **Step 5: CHECKPOINT — aprovação do usuário**

Apresentar `content/CALENDARIO.md` ao usuário. **Parar e aguardar ajustes/aprovação** dos temas antes da Task 3. (Brainstorming definiu esta etapa como obrigatória.)

- [ ] **Step 6: Commit**

```bash
git add content/mana.json content/meditacoes.json content/CALENDARIO.md
git commit -m "Add thematic calendar skeleton for Maná and meditations"
```

---

### Task 3: Redação dos comentários do Maná (60)

**Files:**
- Modify: `content/mana.json` (preencher `textoBiblico` e `comentario`)

**Interfaces:**
- Consumes: temas aprovados na Task 2.
- Produces: `mana.json` completo (textoBiblico = NVI base; comentário 150–250 palavras).

- [ ] **Step 1: Escrever os 60 comentários**

Para cada entrada: inserir o `textoBiblico` (NVI, base — usuário adapta depois) e um `comentario` de **150–250 palavras**, tom acolhedor não-denominacional, conectando o versículo ao tema do dia com aplicação prática e uma frase final de encorajamento. Sem repetir aberturas/clichês entre dias próximos.

- [ ] **Step 2: Validar**

Run: `npm run content:validate`
Expected: sem erros de Maná (datas/campos/contagem de palavras 100–300). Erros de Meditações ainda podem aparecer (transcrições vazias) — ok nesta fase.

- [ ] **Step 3: Commit**

```bash
git add content/mana.json
git commit -m "Write 60 Maná Diário devotional commentaries"
```

---

### Task 4: Redação dos roteiros das meditações (18)

**Files:**
- Modify: `content/meditacoes.json` (preencher `textoBiblico` e `transcricao`)

**Interfaces:**
- Consumes: títulos aprovados (Task 2).
- Produces: `meditacoes.json` com roteiros completos prontos para TTS (marcação de emoção/pausas).

- [ ] **Step 1: Escrever os 18 roteiros**

Para cada meditação: `textoBiblico` (NVI base) e `transcricao` = roteiro guiado completo, com **marcação para ElevenLabs**: pausas com reticências/quebras e, quando útil, tags expressivas (ex.: `[calm]`, `[whispers]`) compatíveis com o modelo escolhido. Comprimento conforme a duração-alvo da categoria (ritmo ~120 wpm: ~3min≈360 palavras … ~10min≈1100–1200 palavras). Estrutura: acolhimento → respiração → leitura do texto → reflexão guiada → silêncio/aplicação → bênção final.

- [ ] **Step 2: Validar**

Run: `npm run content:validate`
Expected: `✅ Conteúdo válido: 60 maná, 18 meditações.` (tudo passa; áudio ainda nulo é aceito pelo validador).

- [ ] **Step 3: CHECKPOINT — adaptação bíblica pelo usuário**

**Parar.** O usuário adapta/parafraseia todos os `textoBiblico` (Maná e Meditações) para evitar direitos autorais NVI. Reexecutar `npm run content:validate` após a edição.

- [ ] **Step 4: Commit**

```bash
git add content/meditacoes.json
git commit -m "Write 18 guided meditation scripts with TTS cues"
```

---

### Task 5: Script de geração de áudio (ElevenLabs → Vercel Blob)

**Files:**
- Create: `scripts/generate-audio.ts`
- Create: `scripts/lib/audio.ts` (helpers ElevenLabs + duração)
- Modify: `.env.local` (adicionar `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `BLOB_READ_WRITE_TOKEN`) — **fora do git**

**Interfaces:**
- Consumes: `loadMeditacoes()`; envs `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `BLOB_READ_WRITE_TOKEN`.
- Produces: MP3 no Blob; grava `urlAudio` + `duracaoSegundos` de volta em `content/meditacoes.json`.

- [ ] **Step 1: Pré-requisitos (usuário)**

Confirmar: `ELEVENLABS_API_KEY` válida e `ELEVENLABS_VOICE_ID` (voz PT-BR escolhida) em `.env.local`; Vercel Blob habilitado e `BLOB_READ_WRITE_TOKEN` puxado para `.env.local` (`vercel env pull .env.local`).

- [ ] **Step 2: Criar `scripts/lib/audio.ts`**

```ts
import { parseBuffer } from "music-metadata"

const API = "https://api.elevenlabs.io/v1/text-to-speech"
const MODEL = process.env.ELEVENLABS_MODEL ?? "eleven_multilingual_v2"

export async function tts(text: string): Promise<Buffer> {
  const voice = process.env.ELEVENLABS_VOICE_ID!
  const res = await fetch(`${API}/${voice}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
    }),
  })
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`)
  return Buffer.from(await res.arrayBuffer())
}

export async function durationSeconds(mp3: Buffer): Promise<number> {
  const { format } = await parseBuffer(mp3, "audio/mpeg")
  return Math.round(format.duration ?? 0)
}
```

- [ ] **Step 3: Criar `scripts/generate-audio.ts`**

```ts
import { config } from "dotenv"
config({ path: ".env.local" })
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { put } from "@vercel/blob"
import { loadMeditacoes } from "./lib/content"
import { tts, durationSeconds } from "./lib/audio"

const onlyId = process.argv[2] // opcional: gerar só uma (dry-run)
const file = resolve(process.cwd(), "content/meditacoes.json")

async function main() {
  const meds = loadMeditacoes()
  for (const m of meds) {
    if (onlyId && m.id !== onlyId) continue
    if (m.urlAudio && !onlyId) { console.log(`· pulando ${m.id} (já tem áudio)`); continue }
    console.log(`▶ gerando ${m.id} …`)
    const mp3 = await tts(m.transcricao)
    const dur = await durationSeconds(mp3)
    const blob = await put(`audio/${m.id}.mp3`, mp3, {
      access: "public",
      contentType: "audio/mpeg",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true,
    })
    m.urlAudio = blob.url
    m.duracaoSegundos = dur
    writeFileSync(file, JSON.stringify(meds, null, 2) + "\n")
    console.log(`  ✓ ${m.id}: ${dur}s → ${blob.url}`)
  }
  console.log("Concluído.")
}
main().catch((e) => { console.error(e); process.exit(1) })
```

- [ ] **Step 4: Dry-run em UMA meditação**

Run: `npm run content:audio -- med-foco-1`
Expected: imprime `✓ med-foco-1: <Ns> → https://…blob.vercel-storage.com/audio/med-foco-1.mp3`; `content/meditacoes.json` passa a ter `urlAudio` e `duracaoSegundos` preenchidos nessa entrada. Abrir a URL no navegador toca o áudio.

- [ ] **Step 5: Commit (script; sem .env)**

```bash
git add scripts/generate-audio.ts scripts/lib/audio.ts package.json
git commit -m "Add ElevenLabs audio generation + Vercel Blob upload script"
```

---

### Task 6: Gerar todos os áudios

**Files:**
- Modify: `content/meditacoes.json` (urlAudio + duracaoSegundos de todas as 18)

- [ ] **Step 1: Gerar as 18 narrações**

Run: `npm run content:audio`
Expected: gera as restantes (pula a já feita); ao fim, todas as 18 entradas têm `urlAudio` e `duracaoSegundos`. Custo/uso ElevenLabs proporcional ao total de caracteres.

- [ ] **Step 2: Validar e conferir**

Run: `npm run content:validate`
Expected: `✅ Conteúdo válido`. Conferir manualmente 2–3 URLs de áudio no navegador.

- [ ] **Step 3: Commit**

```bash
git add content/meditacoes.json
git commit -m "Generate narration audio for all 18 meditations"
```

---

### Task 7: Script de seed (upsert no Neon)

**Files:**
- Create: `scripts/seed-content.ts`

**Interfaces:**
- Consumes: `loadMana()`, `loadMeditacoes()`, `db`, schema `manadiario`/`meditacoes`.
- Produces: linhas no Neon (idempotente via upsert).

- [ ] **Step 1: Criar `scripts/seed-content.ts`**

```ts
import { config } from "dotenv"
config({ path: ".env.local" })
import { db } from "../src/lib/db"
import { manadiario, meditacoes } from "../src/lib/db/schema"
import { loadMana, loadMeditacoes } from "./lib/content"

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
```

- [ ] **Step 2: Rodar o seed**

Run: `npm run content:seed`
Expected: `✓ Maná: 60 upserts` e `✓ Meditações: 18 upserts`, sem erro.

- [ ] **Step 3: Verificar idempotência**

Run: `npm run content:seed` (de novo)
Expected: mesma saída, sem duplicar (chaves `mana-<data>` e `med-<cat>-<n>`). Conferir contagens:
Run: `tsx -e "import('./src/lib/db').then(async({db})=>{const s=await import('./src/lib/db/schema');console.log('mana',(await db.select().from(s.manadiario)).length,'meds',(await db.select().from(s.meditacoes)).length)})" 2>/dev/null || echo 'use npm run content:seed output'`
Expected: `mana 60 meds 18`.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-content.ts
git commit -m "Add idempotent content seed script (Neon upsert)"
```

---

### Task 8: Verificação no app + deploy

**Files:** (nenhum novo)

- [ ] **Step 1: Conferir local (apenas telas públicas) e produção**

- A home busca o Maná pela data de hoje. Como o conteúdo começa em 2026-06-27, antes dessa data a home usa o fallback (Salmos 23). Para validar o Maná do dia, conferir a partir de 27/06 ou inserir uma entrada de teste com a data de hoje.
- Push para `main` (deploy de produção) e, logado em https://plenitude.muitomelhor.net, verificar:
  - cada categoria em `/meditacoes/<slug>` lista **2** meditações;
  - abrir uma meditação → player toca o áudio do Blob; ao terminar, progresso registra.

- [ ] **Step 2: Atualizar memória do projeto**

Marcar "Popular conteúdo" como concluído em `memory/project_status.md`.

---

## Self-Review

- **Cobertura do spec:** Fases 0–6 do spec mapeadas → Task 5 step 1 (pré-reqs), Task 2 (calendário/aprovação), Tasks 3–4 (redação), Task 4 step 3 (adaptação bíblica), Tasks 5–6 (áudio+Blob), Task 7 (seed), Task 8 (verificação). ✓
- **Placeholders:** Os textos finais (60+18) são produzidos durante a execução (Tasks 3–4) por design colaborativo — o plano especifica método, comprimento e validação automatizada, não embute os 78 textos. Código dos scripts está completo. ✓
- **Consistência de tipos:** `ManaEntry`/`MeditacaoEntry`, `loadMana`/`loadMeditacoes`, `expectedManaDates`, ids `mana-<data>`/`med-<cat>-<n>` usados de forma idêntica nas Tasks 1, 5, 7. Campos batem com o schema Drizzle (`manadiario`, `meditacoes`). ✓
