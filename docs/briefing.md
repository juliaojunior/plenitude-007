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

## Fix — Clique nos cards quebrado após o loop infinito (2026-07-14)

**Branch:** `fix/carrossel-loop-infinito` (continuação do fix acima, mesma branch, ainda sem merge).

**Causa raiz:** o fix do loop infinito marcava as cópias 2 e 3 (das 3 duplicatas de `children`) com `inert`+`aria-hidden`, assumindo que só a cópia 1 precisava ser clicável. Só que a posição inicial do scroll (`period`) começa exatamente no início da cópia 2, e o auto-avanço/arrasto passeia livremente pelas 3 cópias — ou seja, o conteúdo visível quase nunca é a cópia 1. `inert` desabilita clique/foco/hit-testing no subtree inteiro, então qualquer card visível (cópia 2 ou 3, o caso comum) ficava morto ao toque. Não era gesto de arrastar capturando o toque (não há handler de Framer Motion nem `preventDefault` em lugar nenhum) nem overlay com `pointer-events` — as 3 cópias são só divs flex lado a lado.

**Fix:** removido `inert`/`aria-hidden` das 3 cópias — todas ficam igualmente clicáveis, já que qualquer uma pode estar em vista a qualquer momento. **Trade-off aceito, fora do escopo deste fix:** ordem de Tab e leitor de tela veem os mesmos links 3x — limitação conhecida da técnica de duplicar DOM pra loop infinito, não introduzida por esta correção especificamente (já existiria com qualquer abordagem de duplicação sem uma solução de a11y dedicada, que não foi pedida aqui).

**Pendente:** aprovação visual do usuário no preview (clique, arraste e auto-avanço juntos) antes do merge.

## Fix — Acessibilidade das cópias duplicadas (2026-07-14)

**Branch:** `fix/carrossel-loop-infinito` (continuação, mesma branch, ainda sem merge).

O fix anterior tornou as 3 cópias totalmente acessíveis (sem `inert`, sem `aria-hidden`) pra resolver o clique — mas isso fazia Tab e leitor de tela encontrarem cada categoria/som 3 vezes seguidas. Correção, só em `src/components/carousel.tsx` (não mexeu em `categorias-carrossel.tsx`/`sons-carrossel.tsx`, cobre os dois automaticamente): as 2 cópias duplicadas (visuais, pro loop) agora clonam cada item via `React.Children.map`+`cloneElement`, adicionando `aria-hidden="true"` e `tabIndex={-1}` — tira as duplicatas do Tab e da árvore de acessibilidade sem usar `inert` (que desliga hit-testing e foi o que quebrou o clique da vez passada). `aria-hidden`/`tabIndex` só afetam foco e a árvore a11y; clique por mouse/toque continua funcionando nas 3 cópias. Validado com um teste isolado de `cloneElement` em Node (usando o `react` já instalado, sem framework de teste novo): aria-hidden/tabIndex aplicados, props originais preservadas, original não mutado.

**Pendente:** aprovação visual do usuário — clique, Tab (uma vez só por item), arraste e auto-avanço juntos — antes do merge.

## Imagens definitivas das 11 séries (2026-07-14)

**Branch:** `content/imagens-series` (a partir de `main`, sem merge — aguardando conferência visual do usuário nos 11 cards antes do merge).

Os 11 arquivos entregues em `public/series/` (nome = título da série, ex. `Gravidez.png`, `está tudo bem.png`, `Histórias bíblicas.png`) casaram 1:1 e sem ambiguidade com as 11 séries de `content/series.json` (comparação por título, ignorando maiúsculas/acentos/espaço vs. hífen). Convertidos pra `.webp` com ImageMagick (`magick -resize 480x480^ -gravity center -extent 480x480 -quality 82`), mesmo padrão 480×480 já usado em `public/categorias/`, e renomeados pro slug do id da série sem o prefixo `serie-` (ex. `serie-esta-tudo-bem` → `esta-tudo-bem.webp`). Campo `imagem` de cada série em `content/series.json` atualizado para `/series/<slug>.webp`; `npm run content:seed` rodado e confirmado por query direta: as 11 linhas da tabela `series` têm `imagem` preenchida, nenhuma faltando.

**Pendente:** conferência visual do usuário nos 11 cards da home/tela de séries antes do merge em `main`.

## Campo `ativa` nas séries — ocultar sem apagar (2026-07-14)

**Branch:** `content/imagens-series` (a partir de `main`, sem merge — aguardando conferência visual do usuário, agora só 9 cards na home).

Adicionada coluna `ativa` (`boolean`, default `true`) na tabela `series` via `db:push`. `content/series.json` marca `"ativa": false` só em **"Compaixão"** e **"Primeiros passos"**; as outras 9 continuam sem o campo (assume `true` no seed e no schema). A query que alimenta a grade de séries da home (`getSeries` em `src/app/(app)/home/page.tsx`) agora filtra `where(eq(series.ativa, true))` — as 2 séries ocultas continuam intactas no banco (dados, meditações e progresso do usuário não são tocados) e a rota `/series/[serieId]` continua acessível diretamente por link, só não aparecem na listagem da home. Confirmado por query direta: 11 séries no banco, exatamente essas 2 com `ativa = false`.

**Para reativar uma série no futuro:** mudar `"ativa": false` pra `"ativa": true` (ou remover o campo) em `content/series.json` e rodar `npm run content:seed` de novo — não precisa mexer no banco manualmente.

**Pendente:** conferência visual do usuário (devem aparecer 9 cards na home) antes do merge em `main`.

## Melhorias na tela de Perfil (2026-07-14)

**Branch:** `feat/perfil-melhorias` (a partir de `main`, sem merge — aguardando conferência visual do usuário nos dois temas antes do merge).

**Correções:** o nome exibido caía no literal `"Usuário"` quando `users.name` e o `firstName` do Clerk estavam vazios — trocado por `"Adicionar nome"` em itálico/muted, convidando a editar (`NomeEditor` ganhou a prop `isPlaceholder`). O avatar padrão era o emoji `🧘` (renderiza como uma figura em pose de meditação/trajes orientais em várias fontes de emoji, destoando do tom cristão do app) — único uso no código, trocado por `public/avatar-padrao.webp` (nova ilustração fornecida, convertida no mesmo padrão 480×480 já usado em `public/categorias/`/`public/series/`).

**Conteúdo novo:** nova seção "Progresso de séries" entre "Sua jornada" e "Conquistas", reaproveitando a query `getSeries` — extraída de `src/app/(app)/home/page.tsx` para `src/lib/series.ts` (comportamento idêntico, `/home` agora importa de lá, sem duplicar a query). Mostra `X de Y séries concluídas` + até 3 séries em andamento como links. Conquistas desbloqueadas por completar uma série (`serie-completa-<id>`) ganharam um selo "Série" (fundo `--lavender`) no canto do card, já que antes usavam a mesma cor de tier "prata" das conquistas fixas e ficavam indistinguíveis. Confirmado sem mudança de código: a seção "Conquistas desbloqueadas" já existia (só não aparecia com a conta de teste zerada), e o sino do cabeçalho já leva para `/configuracoes/notificacoes`.

**Design:** números de estatística em `font-light` sobre `--gold` tinham baixo contraste no tema claro (confirmado no print do usuário — lia como um anel vazio) — trocado para `font-semibold`, resolvendo também o estado "zero" sem precisar de copy dedicada. Botão "Sair da conta" perdeu o visual de card (sem fundo/borda), virando texto+ícone discreto, sem cor de alerta. Espaçamento entre "Sua jornada"/"Progresso de séries" e as seções seguintes aumentou de `mb-8` para `mb-10`. O lápis de edição do nome, que só aparecia no hover (invisível em touch), ficou com opacidade base 40% em vez de 0%.

**Decisão registrada:** nenhum selo de "editar" foi adicionado ao avatar em si — não há seletor de avatar funcional nesta sprint, e um selo cosmético sem ação por trás enganaria o usuário. A coluna `users.avatarIcon` já existe no schema mas segue sem uso, pronta para uma futura funcionalidade de escolha de avatar.

**Pendente:** conferência visual do usuário (claro e escuro) antes do merge em `main`.

## Upload de avatar próprio (2026-07-15)

**Branch:** `feat/perfil-melhorias` (continuação, ainda sem merge — aguardando o usuário testar um upload real antes do merge).

`public/usuario.png` (arquivo fonte de referência da sprint anterior, sem nenhuma referência no código) foi apagado.

**Investigação do campo `avatarIcon`:** já existia no schema (`users.avatar_icon`, default `"leaf"`) mas sem nenhum uso no código — nome e default sugerem um identificador curto de ícone pré-definido (slug), não uma URL livre. Decisão: **não reaproveitado**, criada uma coluna nova `avatarUrl` (`text`, nullable) via `db:push`, para não misturar semânticas (chave de ícone vs. URL de imagem enviada). `avatarIcon` continua existindo e sem uso, disponível pra uma futura funcionalidade de ícones pré-definidos se for retomada.

**Fluxo implementado:** novo componente cliente `src/components/avatar-editor.tsx` — o círculo do avatar (com o selo de lápis, agora funcional) abre um `<input type="file" accept="image/*">` nativo ao ser tocado. No navegador: valida tipo (`image/*`) e tamanho original (máx. 5MB) antes de qualquer processamento; redimensiona via `canvas`/`createImageBitmap` para no máximo 512×512 e converte pra `.webp` (qualidade 0.85); envia o resultado como `FormData` pra nova server action `uploadAvatar` em `src/app/actions/progresso.ts`. No servidor: revalida tipo (`image/jpeg`/`png`/`webp`) e tamanho (defesa em profundidade, não confia só na validação do cliente), sobe o arquivo pro Vercel Blob (mesmo mecanismo já usado pros áudios, `@vercel/blob` `put()`) em `avatares/<userId>-<timestamp>.webp`, grava a URL em `users.avatarUrl` e revalida `/perfil`. O componente atualiza o avatar na tela assim que a action retorna a URL, sem recarregar a página, com spinner de carregamento sobre o círculo enquanto isso. Mensagens de erro inline (formato inválido, arquivo grande, falha ao processar) aparecem abaixo do avatar. Quem nunca enviou uma foto continua vendo `/avatar-padrao.webp`. Botão "Remover foto" (server action `removerAvatar`, zera `avatarUrl`) aparece só quando existe uma foto enviada.

**Config necessária:** `next.config.ts` ganhou `images.remotePatterns` para `*.public.blob.vercel-storage.com` (senão o `next/image` recusa renderizar a URL do Blob) e `experimental.serverActions.bodySizeLimit: "2mb"` (limite padrão de 1MB é suficiente pra uma imagem já comprimida no cliente, mas a folga evita falhas em casos de borda).

**Limitações conhecidas:** máximo 5MB no arquivo original (antes da compressão), formatos aceitos JPG/PNG/WEBP, imagem final sempre recomprimida pra webp 512×512. Compressão depende de `canvas`/`createImageBitmap` no navegador (suporte amplo em navegadores modernos, sem fallback pra navegadores muito antigos).

**Pendente:** o usuário vai testar um upload real (enviando uma foto própria) antes do merge em `main`.

## Troca de domínio principal: plenitude → refugio.muitomelhor.net (2026-07-15)

Direto em `main`, sem branch — mudança é 100% configuração externa (Vercel/Hostinger/Clerk), nenhuma referência a domínio hardcoded foi encontrada no código-fonte (`src/`, `manifest.json`, `.env.local` só usam caminhos relativos ou variáveis).

**O que foi feito:**
- **Vercel**: `refugio.muitomelhor.net` adicionado ao projeto `plenitude-007` (`vercel domains add`) e definido como domínio principal — na prática isso significa configurar `plenitude.muitomelhor.net` para redirecionar (308) pro novo domínio via API (`PATCH /v9/projects/.../domains/plenitude.muitomelhor.net` com `redirect`), já que a Vercel não tem esse "setar como principal" na CLI, só via API/dashboard.
- **DNS na Hostinger**: registro `A refugio → 76.76.21.21` (mesmo IP do domínio antigo). SSL emitido automaticamente pela Vercel.
- **Clerk (produção)**: troca de domínio via Backend API (`POST /v1/instance/change_domain`). **Pegadinha encontrada:** passar só `home_url` faz o Clerk tratar como "Primary application" e migrar a infra do Clerk pro domínio raiz (`clerk.muitomelhor.net`) em vez do subdomínio — precisa do flag `is_secondary: true` no body pra manter o padrão anterior (Clerk também no subdomínio, como já era com `clerk.plenitude.muitomelhor.net`). Isso gerou 5 novos CNAMEs (`clerk`, `accounts`, `clkmail`, `clk._domainkey`, `clk2._domainkey`, todos `.refugio.muitomelhor.net`) adicionados na Hostinger. Confirmado 100% verificado (`dns`/`ssl`/`mail: complete`) via `clerk deploy status`.
- **Chaves do Clerk regeneradas**: a troca de domínio gera um novo `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (o domínio do FAPI vem codificado na chave) e um novo `CLERK_SECRET_KEY`. Atualizadas na Vercel (env de produção, `vercel env rm` + `vercel env add`) e disparado `vercel redeploy --target production` pra rebuildar com as novas chaves (`NEXT_PUBLIC_*` é embutido em build time, promover o deployment antigo sem rebuild não seria suficiente).
- **Docs**: `docs/refugio-contexto-para-analise.md` atualizado pra apontar `https://refugio.muitomelhor.net` como URL de produção.

**Teste:** app carrega normalmente em `https://refugio.muitomelhor.net`, redireciona pra `/sign-in`, manifest do PWA resolve com os ícones corretos. Login com Email OTP testado e confirmado funcionando pelo usuário.

**Não foi necessário** (confirmado pelo usuário antes de começar): preservar compatibilidade com PWA já instalado ou push notifications do domínio antigo — só existiam contas de teste em produção.

## Landing page — estrutura (2026-07-15)

**Branch:** `feat/landing-page` (a partir de `main`, sem merge — aguardando o usuário escrever o texto real e revisar).

Rota `/` agora mostra uma landing page pra visitantes deslogados (antes redirecionava direto pra `/sign-in`). Logado continua indo direto pra `/home`, sem mudança.

**Onde editar o texto:** todo o conteúdo (headlines, parágrafos, perguntas/respostas do FAQ, meta tags de SEO) fica em **`src/content/landing.ts`** — um arquivo só, sem nenhum texto espalhado nos componentes visuais. Cada campo ainda não escrito tem um placeholder `"[PREENCHER: ...]"` dizendo exatamente o que falta. Basta editar as strings nesse arquivo; nenhuma mudança de componente é necessária pra trocar o texto.

**Estrutura visual:** 7 seções em `src/components/landing/` (hero, problema, diferencial, vitrine, como-instalar, faq, cta-final), compostas em `landing-page.tsx`. Novos primitivos reutilizáveis em `src/components/ui/`: `accordion.tsx` (novo, via `@radix-ui/react-accordion`) e `tabs.tsx` (novo wrapper, mas a dependência `@radix-ui/react-tabs` já estava no `package.json` sem uso).

**Tema sempre escuro:** a landing força o tema escuro do app independente da preferência do visitante (`src/components/theme-provider.tsx` agora usa `forcedTheme="dark"` do `next-themes` quando `pathname === "/"`) — isso também resolvia uma inconsistência: o Aurora Background usa variantes `dark:` do Tailwind amarradas à classe no `<html>`, então só sobrescrever cor localmente nos componentes da landing deixaria o Aurora renderizando errado atrás do conteúdo. `PROMINENT_ROUTES` em `animated-background.tsx` ganhou `"/"` pra intensidade forte igual ao `/sign-in` (com cuidado: o match precisou de comparação exata pra `"/"`, não `startsWith`, senão toda rota do app viraria "prominent").

**Componentes do 21st.dev usados como referência estrutural** (adaptados à mão, não instalados via CLI — o projeto usa Tailwind v4 CSS-first sem `components.json`, e o Aurora Background já tinha sido adaptado manualmente da mesma forma): hero com reveal de palavra a palavra (inspirado em https://21st.dev/community/components/uniquesonu/animated-hero-section-ui/default), cards de funcionalidade com hover (inspirado em https://21st.dev/community/components/Codehagen/display-cards/default), accordion do FAQ (inspirado em https://21st.dev/community/components/skyleen77/radix-accordion).

**Ajuste fora do plano original:** o build acusou aviso de `metadataBase` não configurado (necessário pra resolver a URL da imagem Open Graph corretamente em produção, senão cai em `localhost:3000`). Adicionado `metadataBase: new URL("https://refugio.muitomelhor.net")` no `metadata` do `src/app/layout.tsx`.

**Fora do escopo (de propósito):** texto final de qualquer seção, captura de e-mail/newsletter, analytics, dados dinâmicos do banco na vitrine (usa texto estático do content file).

**Verificação:** `npx tsc --noEmit` limpo, `npm run lint` limpo (só o warning pré-existente não relacionado em `notificacoes.ts`), `npm run build` completo com sucesso (`/` aparece na lista de rotas). Testado com `npm run dev`: HTML confirma o placeholder da headline (dividido em spans pela animação palavra-a-palavra), links `/sign-in` e `/sign-up`, e o `<title>` com o placeholder de SEO.

**Spec e plano completos:** `docs/superpowers/specs/2026-07-15-landing-page-design.md` e `docs/superpowers/plans/2026-07-15-landing-page.md`.

## Narração real das 44 meditações de série via ElevenLabs (2026-07-15)

**Branch:** `content/audio-series-elevenlabs` (a partir de `main`, sem merge — aguardando o usuário aprovar as amostras antes de rodar `content:seed`).

As 55 meditações exclusivas de série (`content/series-itens.json`) usavam um áudio placeholder compartilhado (`med-paz-1.mp3`, o mesmo mp3 reaproveitado em todas). Geradas as narrações reais para as **44 meditações das 9 séries ativas** (as duas séries com `ativa: false` — Compaixão e Primeiros passos — ficaram de fora desta rodada, por pedido do usuário).

**Pipeline reutilizado:** mesmo `voice_id` (`ZP7ctTmcovXNUmOj695o`) e modelo (`eleven_v3`) usados nas 18 meditações originais, encontrados em `scripts/generate-audio.ts` + `.env.local`. Sem `voice_settings` explícito (só é enviado quando o modelo não é `eleven_v3`).

**Gap descoberto e resolvido:** as 18 originais têm dois campos de texto — `transcricao` (limpo, pra tela) e `roteiroAudio` (mesmo texto com tags de emoção `[warmly]`/`[calm]`/`[gently]`/etc. e pausas `<break time="X.Xs" />`, usado como entrada real da TTS). `series-itens.json` só tinha `transcricao`. Escrevi `roteiroAudio` pra cada uma das 44, com heurística por parágrafo seguindo a mesma convenção de tags (abertura, respiração, escritura, reflexão, reafirmação, oração final — com paleta mais "sonolenta" pra série Boa noite). Isso foi confirmado com o usuário antes de prosseguir.

**Refactor:** lógica de chamada à API TTS extraída pra `scripts/lib/tts.ts`, reaproveitada por `scripts/generate-audio.ts` (18 originais) e pelo novo `scripts/generate-audio-series.ts` (44 de série). Durante a extração, um bug de ordem de carregamento de módulos ES fez a primeira rodada falhar 44/44 (env vars lidas no nível do módulo antes do `dotenv.config()` rodar) — corrigido lendo as env vars dentro da função, não no top-level.

**Resultado:** 44/44 narrações geradas com sucesso na segunda rodada (após o fix), 0 falhas, sem precisar de retry. Duração real entre 65s e 127s por item. Todos os 44 mp3s enviados pro Vercel Blob (`audio/<id>.mp3`, mesma convenção dos originais).

**Cota ElevenLabs:** não foi possível checar via API — a chave não tem o escopo `user_read` habilitado (mesma limitação já registrada anteriormente). Caracteres efetivamente enviados à API (via `roteiroAudio`, não `transcricao`): 48.836 chars pros 44 itens. O usuário decidiu prosseguir sem confirmação prévia da cota, dado o histórico de geração bem-sucedida.

**Amostras ouvidas e aprovadas pelo usuário:** lote de teste inicial (Bom dia, SOS, Histórias bíblicas — Davi e Golias) aprovado antes da rodada completa. 4 amostras adicionais de séries diferentes (Gravidez, Está tudo bem, Momento presente, Boa noite) separadas ao final, pendentes de audição.

**Pendente:** usuário ouvir as 4 amostras finais e confirmar antes de rodar `npm run content:seed` (banco local e produção são o mesmo — rodar o seed publica as narrações direto pros usuários). Nenhuma alteração de conteúdo foi publicada nesta rodada, só commitada na branch.

## Publicação da narração das séries + merge em main (2026-07-15)

`content:seed` rodado após aprovação do usuário: 44/44 meditações de série com `urlAudio`/`duracaoSegundos` reais confirmados por query direta no banco (as 11 de Compaixão/Primeiros passos permanecem com o placeholder, sem alteração). Branch `content/audio-series-elevenlabs` mesclada em `main` (merge normal, sem squash) via commit `b9790f1`, build limpo, push feito e deploy de produção confirmado `READY` em `refugio.muitomelhor.net`.

## Narração do Maná Diário — script reutilizável via ElevenLabs (2026-07-18)

**Branch:** `feat/audio-mana-diario` (a partir de `main`, sem merge).

Diferente das meditações e séries (conteúdo fechado, geradas em lote único), o Maná Diário é criado continuamente pelo usuário em lotes de 60 dias — então em vez de um script de lote único, foi construído um **script reutilizável e idempotente**: `scripts/generate-mana-audio.ts` (`npm run content:audio-mana`). Ele lê `content/mana.json`, filtra só as entradas sem `urlAudio`, gera `roteiroAudio` pra elas se ainda não tiver, chama a TTS, sobe pro Vercel Blob e grava `urlAudio`/`duracaoSegundos` — salvando o JSON a cada item processado, então nunca perde progresso e nunca regera o que já tem áudio real.

**Como reutilizar em lotes futuros:** rodar `npm run content:audio-mana` sem argumentos narra tudo que estiver pendente. Aceita `--limit N` (só os N primeiros pendentes, útil pra lotes de teste) e um dia específico via `YYYY-MM-DD` como argumento posicional.

**Voz:** `EIkHVdkuarjkYUyMnoes` — diferente da voz das meditações/séries (`ELEVENLABS_VOICE_ID` no `.env.local`), de propósito. Para permitir isso sem duplicar o helper de TTS, `scripts/lib/tts.ts` ganhou um parâmetro opcional `voiceId` em `tts()`/`ttsOne()` (default: o env var global, então as chamadas existentes de meditações/séries não mudam).

**Roteiro fixo (não heurístico):** diferente das meditações, o Maná sempre segue a mesma estrutura (texto bíblico → referência → comentário), então o roteiro é montado programaticamente, sem heurística por parágrafo: `[slowly] {textoBiblico} <break time="1.2s" /> [softly] {referencia} <break time="1.5s" /> [gently] {comentário com <break time="0.6s" /> entre frases}`. Confirmado que as tags de emoção/pausa funcionam igual com `eleven_v3` independente da voz.

**Schema:** colunas `urlAudio`/`duracaoSegundos` adicionadas em `mana_diario` (mesmo padrão de `meditacoes`), sincronizadas via `npm run db:push` (projeto não usa migrations geradas, só push direto). `seed-content.ts` atualizado pra incluir os dois campos no upsert do Maná.

**Cota ElevenLabs:** mesma limitação já registrada — a chave não tem escopo `user_read`, não dá pra checar cota via API. O script reporta o total de caracteres enviados.

**Lote de teste gerado:** 3 primeiros Manás (2026-06-27, 2026-06-28, 2026-06-29), 5.141 caracteres enviados, 3/3 sucesso sem retry, durações entre 103s e 111s. Amostras em:
- https://hfhfrda6ggx58ctr.public.blob.vercel-storage.com/audio/mana-2026-06-27.mp3
- https://hfhfrda6ggx58ctr.public.blob.vercel-storage.com/audio/mana-2026-06-28.mp3
- https://hfhfrda6ggx58ctr.public.blob.vercel-storage.com/audio/mana-2026-06-29.mp3

**Pendente:** usuário ouvir as 3 amostras e aprovar voz/ritmo/pausas antes de rodar o restante dos ~57 Manás. `content:seed` ainda não rodou — banco compartilhado, aguardando aprovação final do lote completo. Botão de áudio na home (`ManaAudioButton`) ainda não implementado — fica pra depois da aprovação.
