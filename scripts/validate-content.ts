import {
  loadMana, loadMeditacoes, expectedManaDates,
  CATEGORIA_SLUGS, MANA_COUNT, loadSeries, loadSerieItens,
} from "./lib/content"

const errors: string[] = []
const wc = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

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

const meds = loadMeditacoes()
if (meds.length !== 18) errors.push(`Meditações: esperado 18, achou ${meds.length}`)
const porCategoria = new Map<string, number>()
const ids = new Set<string>()
for (const m of meds) {
  if (!CATEGORIA_SLUGS.includes(m.categoria as never)) errors.push(`Meditação ${m.id}: categoria inválida "${m.categoria}"`)
  porCategoria.set(m.categoria, (porCategoria.get(m.categoria) ?? 0) + 1)
  if (ids.has(m.id)) errors.push(`Meditação: id duplicado "${m.id}"`)
  ids.add(m.id)
  for (const f of ["titulo", "referencia", "textoBiblico", "transcricao", "roteiroAudio"] as const) {
    if (!m[f]?.trim()) errors.push(`Meditação ${m.id}: ${f} vazio`)
  }
  if (m.transcricao?.includes("<break")) errors.push(`Meditação ${m.id}: transcricao contém tags (deve ser texto limpo)`)
  if (m.transcricao?.includes("[")) errors.push(`Meditação ${m.id}: transcricao contém tags (deve ser texto limpo)`)
}
for (const slug of CATEGORIA_SLUGS) {
  const c = porCategoria.get(slug) ?? 0
  if (c !== 2) errors.push(`Categoria "${slug}": ${c} meditações (esperado 2)`)
}

const seriesList = loadSeries()
if (seriesList.length !== 11) errors.push(`Séries: esperado 11, achou ${seriesList.length}`)
const serieIds = new Set<string>()
for (const s of seriesList) {
  if (serieIds.has(s.id)) errors.push(`Série: id duplicado "${s.id}"`)
  serieIds.add(s.id)
  if (!s.titulo?.trim()) errors.push(`Série ${s.id}: titulo vazio`)
}

const serieItens = loadSerieItens()
const serieItemIds = new Set<string>()
for (const item of serieItens) {
  if (serieItemIds.has(item.id)) errors.push(`Item de série: id duplicado "${item.id}"`)
  serieItemIds.add(item.id)
  if (!serieIds.has(item.serieId)) errors.push(`Item de série ${item.id}: serieId "${item.serieId}" não existe em series.json`)
  if (!item.titulo?.trim()) errors.push(`Item de série ${item.id}: titulo vazio`)
  if (!item.urlAudio?.trim()) errors.push(`Item de série ${item.id}: urlAudio vazio`)
}

if (errors.length) {
  console.error(`❌ ${errors.length} problema(s):\n` + errors.map((e) => " - " + e).join("\n"))
  process.exit(1)
}
console.log(`✅ Conteúdo válido: ${mana.length} maná, ${meds.length} meditações.`)
