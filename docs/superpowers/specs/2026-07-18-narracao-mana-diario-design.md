# Narração do Maná Diário (script reutilizável)

## Contexto

Meditações e séries já têm narração real via ElevenLabs, geradas por scripts de lote único (`generate-audio.ts`, `generate-audio-series.ts`). O Maná Diário é diferente: é criado continuamente em lotes de 60 dias, direto no Code, então precisa de um script **reutilizável e idempotente** — roda de novo a qualquer momento e só narra os Manás que ainda não têm áudio.

Voz do Maná: `EIkHVdkuarjkYUyMnoes` — diferente da voz usada em meditações/séries (env var `ELEVENLABS_VOICE_ID`), proposital.

Hoje `content/mana.json` tem 60 entradas, nenhuma com `urlAudio`. A tabela `mana_diario` não tem colunas de áudio.

## Modelo de dados

- `mana_diario` (schema.ts): adicionar `urlAudio` (text, nullable) e `duracaoSegundos` (integer, nullable) — mesmo padrão de `meditacoes`.
- `ManaEntry` (`scripts/lib/content.ts`): adicionar `roteiroAudio?`, `urlAudio?`, `duracaoSegundos?`. Campos de exibição (`textoBiblico`, `referencia`, `comentario`) não mudam.
- `seed-content.ts`: o upsert de Maná passa a incluir `urlAudio`/`duracaoSegundos` no insert e no `set` do `onConflictDoUpdate`.

## Roteiro de narração (fixo, não heurístico)

Diferente das meditações (heurística por parágrafo), o Maná segue sempre a mesma estrutura, então o roteiro é montado programaticamente:

```
[slowly] {textoBiblico} <break time="1.2s" /> [softly] {referencia} <break time="1.5s" /> [gently] {comentario}
```

Dentro do `comentario`, insere `<break time="0.6s" />` entre frases (split por `/(?<=[.!?…])\s+/`, mesmo regex usado em `chunk()` de `scripts/lib/tts.ts`). Salvo como `roteiroAudio` em `content/mana.json`, gerado uma vez por entrada (se já existir, não regenera).

As tags `[slowly]`/`[softly]`/`[gently]`/`<break>` já são suportadas pelo `eleven_v3` independente da voz — mesmo mecanismo usado nas meditações.

## `scripts/lib/tts.ts`

Pequena mudança: `tts()` e `ttsOne()` passam a aceitar um `voiceId` opcional (default: `process.env.ELEVENLABS_VOICE_ID`), para permitir vozes diferentes por script sem tocar no env var global usado por meditações/séries.

## `scripts/generate-mana-audio.ts` (novo)

Espelha `generate-audio-series.ts`: retry de 3 tentativas por item, salva `content/mana.json` incrementalmente a cada sucesso (não perde progresso se cair no meio do lote).

Fluxo:
1. Carrega `content/mana.json`.
2. Filtra entradas com `!m.urlAudio`.
3. Para cada uma: gera `roteiroAudio` se ausente (grava no JSON); chama `tts(roteiro, { voiceId: "EIkHVdkuarjkYUyMnoes" })`; upload pro Vercel Blob em `audio/mana-{data}.mp3`; calcula duração; grava `urlAudio`/`duracaoSegundos`.
4. Suporta `--limit N` (lote de teste, ex. 3 primeiros pendentes) e um dia específico via arg posicional (`YYYY-MM-DD`), igual ao `onlyId` de `generate-audio.ts`.

Cota ElevenLabs: a chave não tem escopo `user_read` (limitação já conhecida de sessões anteriores) — não dá pra checar cota via API. O script reporta o total de caracteres enviados; conferir saldo manualmente no dashboard.

**Não roda `content:seed`** nesta fase — banco compartilhado, só depois de aprovação final do lote completo.

## UI — botão de áudio na home

Novo client component `ManaAudioButton` (`src/components/mana-audio-button.tsx`), inspirado em `audio-player.tsx` mas minimalista: sem barra de progresso, só ícone `Headphones`/`Pause` (lucide) que alterna play/pause de um `<audio>` interno. Posicionado no canto superior direito da seção "Maná Diário" (`home/page.tsx`), ao lado do label — discreto, não compete com o texto bíblico. Só renderiza se `mana.urlAudio` existir.

## Fases de execução

1. Branch `feat/audio-mana-diario` a partir de `main`.
2. Schema + migration + `seed-content.ts` + mudança em `tts.ts` + função de roteiro + script novo.
3. Rodar `--limit 3` (dias diferentes) → **parar, aguardar aprovação da voz/ritmo**.
4. (Só após aprovação) rodar o restante dos ~57 Manás.
5. UI do botão de áudio.
6. Commit/push a cada fase; atualizar `docs/briefing.md` (append, não sobrescrever).

## Fora de escopo (YAGNI)

- Player com barra de progresso/seek no Maná (só play/pause).
- CRUD de admin para os campos de áudio do Maná (segue padrão atual: JSON + `content:seed`).
- Rodar `content:seed` antes da aprovação final do lote completo.
