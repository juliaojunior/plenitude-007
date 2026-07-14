# Briefing — Refúgio

Registro de sprints e decisões de produto/técnicas, por seção. Não sobrescrever seções existentes — sempre acrescentar.

## Sprint 1 — Home: carrosséis (categorias + sons)

**Branch:** `sprint-1-carrosseis` (a partir de `main`, sem merge).

**O que foi feito:**
- Removida a grade estática de categorias da `/home`. Nova ordem da tela: Maná Diário → Carrossel de categorias → Carrossel de sons → `TODO Sprint 2: grade de séries`.
- Componente `src/components/carousel.tsx`: carrossel horizontal genérico e reutilizável. Scroll/drag manual via overflow nativo (`overflow-x-auto` + `snap-x`); auto-avanço via `requestAnimationFrame` que empurra `scrollLeft` e volta ao início ao chegar no fim. Auto-avanço é pulado inteiramente se `prefers-reduced-motion: reduce` estiver ativo; pausa enquanto o usuário segura/arrasta (`pointerdown`/`touchstart`) e retoma ao soltar.
- `src/components/categorias-carrossel.tsx`: client component que embaralha as 9 categorias a cada carregamento. Shuffle acontece em `useEffect` (pós-hidratação) para não gerar mismatch entre servidor e cliente — a primeira renderização usa a ordem original do array, e só depois de montar o array é embaralhado no cliente.
- Nova tabela `sons` no schema Drizzle (`src/lib/db/schema.ts`): `id`, `titulo`, `urlAudio`, `duracaoSegundos`, `imagem`, `cor`, `descricao`, timestamps. Aplicada ao Neon via `npm run db:push` (projeto não usa pasta de migrations versionada — todas as tabelas existentes foram criadas do mesmo jeito).
- `content/sons.json`: 3 itens placeholder (Chuva Suave, Brisa Calma, Silêncio Orante). Os áudios apontam para MP3s já hospedados no Blob (reaproveitados de meditações existentes) só para o carrossel/player funcionarem de ponta a ponta — **trocar pelos áudios reais quando disponíveis**. Imagens reaproveitam os `.webp` de categoria já existentes.
- `scripts/seed-content.ts` estendido para fazer upsert de `sons.json` (idempotente, mesmo padrão de `onConflictDoUpdate` usado para meditações/maná). Testado rodando o seed 2x seguidas — 3 linhas na tabela, sem duplicar.
- `src/components/sons-carrossel.tsx`: mesmo comportamento visual/de movimento do carrossel de categorias, alimentado pela tabela `sons`. Se não houver sons cadastrados, a seção inteira é omitida na home (sem título, sem espaço vazio).
- Nova rota `src/app/(app)/sons/[id]/page.tsx`: título + `<audio controls loop>` nativo. Sem texto bíblico, sem transcrição, sem botão de favoritar, sem chamada às server actions de progresso/estatísticas — som não conta para a jornada do usuário.

**Fora do escopo (não fiz, de propósito):** grade de séries, tabela de conclusão de sons por usuário, favoritar sons, troca de domínio, página 404, reedição de áudio.

**Verificação:** `tsc --noEmit` limpo, `npm run lint` limpo (só um warning pré-existente não relacionado), `npm run build` completo com sucesso e `/sons/[id]` listado nas rotas. Testado localmente (`npm run dev`): `/home` e `/sons/[id]` redirecionam corretamente para `/sign-in` quando deslogado (middleware/Clerk intactos) — teste visual logado da UI não foi possível localmente porque as chaves Clerk são de produção e só autenticam no domínio `plenitude.muitomelhor.net` (restrição conhecida do projeto); validar no preview da Vercel gerado a partir desta branch.

## Atualização de segurança — Next.js / React Server Components (2026-07-11)

**Branch:** `chore/seguranca-nextjs` (a partir de `main`, sem merge).

Atualizado `next` 16.2.9 → **16.2.10**, `react`/`react-dom` 19.2.4 → **19.2.7** e `eslint-config-next` para acompanhar, cobrindo as correções de segurança de RSC de maio/2026 (CVE-2026-23870 de negação de serviço e bypass de autorização via proxy). Os pacotes `react-server-dom-*` não são dependência direta do projeto — vêm embutidos no `next`, então já foram junto. Nenhum ajuste de código foi necessário; build, lint e o redirect de autenticação (`/home`, `/sons/[id]` → `/sign-in` quando deslogado) continuam idênticos ao testar localmente. `npm audit` aponta 7 vulnerabilidades moderadas pré-existentes, sem relação com esta atualização (esbuild via `drizzle-kit` — só dev tooling; postcss vendorizado dentro do próprio `next`, sem fix disponível upstream) — não foram tocadas, ficam para outra hora se o usuário quiser.

## Fix — Transcrição truncada com "Mostrar mais" (2026-07-11)

**Branch:** `fix/transcricao-mostrar-mais` (a partir de `main`, sem merge).

Na tela de meditação individual (`/meditacoes/[categoria]/[id]`), a transcrição agora começa truncada em 4 linhas (`line-clamp-4`, CSS nativo do Tailwind v4 — corta sempre em quebra de palavra, nunca no meio de uma) com um botão "Mostrar mais"/"Mostrar menos". Novo componente `src/components/transcricao-expandivel.tsx`: mede via `scrollHeight` vs `clientHeight` se o texto realmente estourou o clamp (`useEffect` pós-montagem) e só então mostra o botão — transcrições curtas não ganham botão. Transição de expandir/recolher usa `motion` (`layout` prop, já instalado no projeto) para animar a altura suavemente via FLIP, sem cálculo manual de pixels; respeita `prefers-reduced-motion` via `useReducedMotion()` do próprio `motion` (desliga a animação, mantém o toggle instantâneo). Texto bíblico e o resto da tela não foram tocados.

## Sons/Músicas via ElevenLabs — Sound Effects + Music (2026-07-14)

**Branch:** `content/sons-elevenlabs` (a partir de `main`, sem merge, sem `content:seed` rodado — banco local e produção são o mesmo Neon).

**Gerados com sucesso (8/8):**
- 6 sons ambiente via API **Sound Effects** (`/v1/sound-generation`, `loop: true`, `prompt_influence: 0.3`): Chuva Suave (atualiza o placeholder `som-chuva`), Ondas do Mar, Floresta ao Amanhecer, Riacho Suave, Brisa Noturna, Sinos de Cristal — todas pedidas a 30s (o teto real da API é 30s, não 30-45s como o briefing original assumia; irrelevante já que o player toca em loop).
- 2 músicas via API **Music** (`/v1/music`, `model_id: music_v2`, `music_length_ms: 165000`): Piano Suave (~177s) e Cordas Ambiente (~170s) — a API devolveu áudio um pouco mais longo que o pedido, sem problema.
- Todos os 8 passaram por **crossfade de potência constante** (curvas seno/cosseno, `g_in²+g_out²=1`, janela de 2.5s) antes do upload — script novo `scripts/generate-sons.ts`, sem dependência nova: decodifica o MP3 pra PCM via `ffmpeg`, aplica o crossfade em JS puro (não achei o relatório/script Python anexado nesta sessão; numpy/scipy também não estavam disponíveis no ambiente, então reimplementei a mesma técnica sem numpy) e reencoda pra MP3 (`libmp3lame`). Duração final calculada com `ffprobe` (precisou escrever em arquivo temporário — `ffprobe` não lê duração de um MP3 via stdin/pipe, retorna `N/A`).
- Upload pro Vercel Blob em `audio/<id>.mp3` (mesma convenção já usada pros áudios de meditação). `content/sons.json` reconciliado: `som-chuva` atualizado in-place; `som-brisa` e `som-silencio-orante` (placeholders que não correspondem a nenhum item novo) ficaram intocados; os outros 7 são entradas novas. Campo novo opcional `tipo: 'ambiente' | 'musica'` no schema de conteúdo (`scripts/lib/content.ts`), só no JSON — **não** foi adicionada coluna na tabela `sons` do Neon (Drizzle), fica pra quando o seed for aprovado e, se quiser persistir o campo, adicionar a coluna nessa hora.

**Pendências/observações:**
- **Bloqueio de permissão (resolvido pelo usuário):** a chave ElevenLabs em `.env.local` (mesma usada pra narração TTS) inicialmente não tinha os escopos `sound_generation`/`music_generation` habilitados, apesar do briefing assumir que sim — todas as 8 chamadas falharam com 401 na primeira tentativa (sem custo, nenhum crédito consumido). Usuário habilitou os escopos no dashboard da ElevenLabs e a segunda rodada funcionou 100%.
- **Cota consumida:** não foi possível consultar via API (a chave também não tem o escopo `user_read` — `/v1/user` e `/v1/user/subscription` retornam 401 `missing_permissions`). Conferir manualmente no dashboard da ElevenLabs (Usage/Subscription) se quiser saber o saldo exato.
- **Corte de crossfade nas músicas:** ainda não ouvi os 2 arquivos de música pra confirmar se o corte cai de forma perceptível no meio de uma frase melódica — pedir pro usuário conferir ao ouvir (ver resumo da conversa).
- Imagens dos cards continuam reaproveitando os `.webp` de categoria já existentes como placeholder (mesma prática já usada nos 3 sons antigos) — ícones definitivos ficam pra depois.
- **Não rodei `npm run content:seed`** — mudança fica só no JSON, commitada na branch, aguardando o usuário ouvir os áudios e aprovar.

## Publicação dos 8 sons/músicas aprovados (2026-07-14)

Usuário ouviu os 8 áudios (6 ambiente + 2 música) e aprovou todos, sem ressalvas — incluindo o tratamento de loop e o corte de crossfade nas músicas.

Adicionada a coluna `tipo` (text, nullable) à tabela `sons` no Neon via `db:push`, e `scripts/seed-content.ts` passou a gravá-la — decisão do usuário, pra deixar o campo persistido no banco (antes só existia em `content/sons.json`/`scripts/generate-sons.ts`). Rodado `npm run content:seed`: os 8 itens novos entraram/atualizaram na tabela `sons` com `urlAudio`, `duracaoSegundos` e `tipo` corretos, confirmado via query direta no Neon. Os 2 placeholders antigos (`som-brisa`, `som-silencio-orante`) permaneceram intocados (`tipo` null), sem duplicar nada — não faziam parte do lote aprovado.

Branch `content/sons-elevenlabs` mesclada em `main` (merge normal, histórico preservado, sem squash) e enviada pro GitHub, disparando o deploy de produção (commit `0175681`). Build local (`npm run build`) e deploy na Vercel concluídos sem erro.

**Pendente:** ícones/imagens definitivos dos 8 cards — continuam reaproveitando os `.webp` de categoria como placeholder, aguardando as artes do usuário.

## Remoção dos placeholders de som (2026-07-14)

Removidas as entradas `som-brisa` e `som-silencio-orante` de `content/sons.json` (Sprint 1, nunca substituídas pelos áudios reais). `npm run content:seed` é upsert-only — não remove do banco linhas que saíram do JSON —, então as 2 linhas foram apagadas com `DELETE` direto na tabela `sons` de produção (Neon), sem tabela relacionada afetada (sons não são favoritáveis). Confirmado por query: tabela `sons` agora tem só os 8 itens reais (6 `ambiente` + 2 `musica`). Branch `chore/remove-sons-placeholder` mesclada em `main` (merge normal) e deploy de produção disparado.

## Fix — Loop infinito dos carrosséis sem salto visual (2026-07-14)

**Branch:** `fix/carrossel-loop-infinito` (a partir de `main`, sem merge — aguardando aprovação visual do usuário no preview).

Antes, o auto-avanço chegava no fim da lista de itens e resetava `scrollLeft` pra `0` de forma abrupta — um corte visível, não um loop contínuo. Técnica aplicada em `src/components/carousel.tsx`: `children` é renderizado **3 vezes** (cópia real + 2 duplicatas marcadas `inert`+`aria-hidden`, invisíveis a teclado/leitor de tela), começando na cópia do meio para dar margem de arrasto nos dois sentidos. Um "período" (largura de uma cópia + o gap até a próxima) é **medido** via `getBoundingClientRect()` entre o início da cópia 1 e da cópia 2 — não assume um valor fixo de gap/largura. Sempre que a posição ultrapassa `2×período` (auto-avanço) ou os limites via scroll manual, ela é ajustada somando/subtraindo exatamente 1 período; como o conteúdo ali é idêntico (é a cópia duplicada), o ajuste é instantâneo e imperceptível — nenhuma transição nesse instante.

Esse arquivo também absorve o fix de sub-pixel da branch `fix/carrossel-auto-scroll` (ainda não mesclada): o incremento por frame virou delta de tempo (`performance.now()`), necessário pra qualquer movimento contínuo funcionar de verdade. **Atenção ao mesclar as duas branches em `main`:** pode haver conflito trivial em `carousel.tsx`, já que este arquivo aqui contém as duas correções combinadas — a branch mais antiga pode ficar redundante depois que esta for mesclada.

Pausa em touch/drag e `prefers-reduced-motion` continuam intactos; o listener de wrap por scroll fica ativo mesmo com reduced-motion ligado, pra o arrasto manual continuar funcionando sem comportamento estranho nas bordas mesmo sem auto-avanço.

**Pendente:** aprovação visual do usuário no preview antes do merge.
