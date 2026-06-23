# Plano de Conteúdo — Maná Diário (60 dias) + Meditações (18)

**Data:** 2026-06-23
**App:** Refúgio (PWA de meditação cristã)
**Status:** Design aprovado pelo usuário; pronto para virar plano de implementação.

## Objetivo

Deixar pronto **2 meses de conteúdo** para o app:
- **Maná Diário**: 60 entradas (uma por dia), cada uma com um texto bíblico, referência e um comentário devocional diferente.
- **Meditações**: ao menos 2 por categoria (9 categorias → 18 meditações), cada uma com texto bíblico, referência, roteiro (transcrição) e **áudio narrado**.

## Decisões fechadas

| Tema | Decisão |
|---|---|
| Produção dos textos | **Colaboração**: eu (Claude) escrevo os textos a partir de temas; o usuário ajusta |
| Tradução bíblica | **NVI** como base; **o usuário adapta/parafraseia** os textos bíblicos antes do áudio (direitos autorais) |
| Áudio | **ElevenLabs API**, voz PT-BR natural; roteiros preparados com marcação de emoção/pausas |
| Hospedagem do áudio | **Vercel Blob** |
| Tom / linha | **Cristão acolhedor, não-denominacional** (público amplo) |
| Ingestão no banco | **Script de seed** (Drizzle), não digitação manual no /admin |
| Início do Maná | **2026-06-27** (datas sequenciais por 60 dias → até 2026-08-25) |

## Escopo e quantidades

- **Maná Diário**: 60 entradas, datas de 2026-06-27 a 2026-08-25.
- **Meditações**: 18 (2 por categoria). Categorias: ansiedade, agradecer, paz, sabedoria, sono, foco, perdao, esperanca, cura.

### Duração-alvo por categoria (varia)

| Categoria | Duração | Categoria | Duração |
|---|---|---|---|
| ansiedade | ~4 min | perdao | ~6 min |
| agradecer | ~4 min | esperanca | ~5 min |
| paz | ~5 min | cura | ~6 min |
| sabedoria | ~6 min | sono | ~10 min |
| foco | ~3 min | | |

Ritmo de narração de meditação ≈ 110–130 palavras/min (mais lento que fala normal, com pausas).

## Pipeline de produção (com responsáveis)

1. **Calendário temático** *(Claude)* — propor os 60 temas do Maná + os 18 títulos/temas de meditação. → **usuário ajusta**. *(primeiro entregável)*
2. **Redação** *(Claude)* — escrever todos os textos: comentários do Maná (~150–250 palavras) e roteiros das meditações (com marcação de emoção/pausas para ElevenLabs).
3. **Adaptação bíblica** *(usuário)* — parafrasear os textos bíblicos NVI.
4. **Geração de áudio** *(script)* — ElevenLabs converte os 18 roteiros em MP3 PT-BR expressivo.
5. **Hospedagem** *(script)* — subir os MP3 no Vercel Blob e capturar as URLs públicas.
6. **Ingestão no banco** *(script seed)* — inserir/atualizar os 60 Maná + 18 meditações no Neon de uma vez.

## Formato de dados (arquivos no repo)

Os textos ficam em arquivos versionados que alimentam os scripts.

`content/mana.json` — array de:
```jsonc
{
  "data": "2026-06-27",      // YYYY-MM-DD (chave única)
  "referencia": "Salmos 23:1",
  "textoBiblico": "…",        // base NVI; usuário adapta antes do áudio
  "comentario": "…"           // ~150–250 palavras, tom acolhedor
}
```

`content/meditacoes.json` — array de:
```jsonc
{
  "id": "med-ansiedade-1",    // id determinístico (slug + índice) → re-seed atualiza, não duplica
  "titulo": "…",
  "categoria": "ansiedade",   // slug de CATEGORIAS
  "referencia": "Filipenses 4:6-7",
  "textoBiblico": "…",
  "transcricao": "…",          // roteiro completo com marcação de emoção/pausas
  "duracaoSegundos": null,     // preenchido após gerar o áudio
  "urlAudio": null             // preenchido após upload no Blob
}
```

## Scripts (a detalhar no plano de implementação)

- `scripts/seed-content.ts` — lê os JSON e faz **upsert** no Neon via Drizzle.
  - Maná: chave única `data` → `onConflictDoUpdate`.
  - Meditações: id determinístico (`med-<categoria>-<n>`) → `onConflictDoUpdate`. Idempotente (rodar de novo não duplica).
- `scripts/generate-audio.ts` — para cada meditação sem `urlAudio`: chama ElevenLabs (modelo expressivo, ex. `eleven_v3`/`eleven_multilingual_v2`), salva MP3, sobe no Vercel Blob (`@vercel/blob` `put`), mede duração e grava `urlAudio` + `duracaoSegundos` de volta no `content/meditacoes.json`.
  - Voz e modelo configuráveis por env/constante.
  - Roteiros já vêm com marcação de emoção/pausa (tags do ElevenLabs v3 e/ou pausas).

## Pré-requisitos / credenciais (do usuário)

- `ELEVENLABS_API_KEY` — usuário cria e fornece; escolher a **voz** PT-BR (Claude sugere 2–3).
- **Vercel Blob** habilitado no projeto → `BLOB_READ_WRITE_TOKEN` (pull para `.env.local` no uso local).
- `DATABASE_URL` (Neon) — já configurado.

## Sequência de implementação

- **Fase 0** — Pré-requisitos: chave ElevenLabs, escolher voz, habilitar Blob.
- **Fase 1** — Calendário temático (60 temas Maná + 18 títulos) → aprovação do usuário.
- **Fase 2** — Redação dos textos → `content/*.json`.
- **Fase 3** — Usuário adapta os textos bíblicos.
- **Fase 4** — `generate-audio.ts`: gerar áudios + upload Blob.
- **Fase 5** — `seed-content.ts`: popular o Neon.
- **Fase 6** — Verificar no app (home com Maná do dia; categorias com 2 meditações cada; player tocando).

## Fora de escopo (YAGNI por agora)

- Upload de áudio pela UI do `/admin` (usamos script; o /admin continua para edições pontuais).
- CMS/editor avançado de conteúdo.
- Mais motion graphics (retomado depois, conforme combinado).
- Página 404 customizada.

## Itens em aberto (resolver no início)

- Escolha final da **voz** ElevenLabs (Claude sugere; usuário decide).
- Conferir se um único modelo de voz atende todas as categorias ou se Sono usa tom mais sussurrado.
