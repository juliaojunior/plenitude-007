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
