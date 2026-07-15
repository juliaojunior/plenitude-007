# Landing Page — Design

**Data:** 2026-07-15
**Branch:** `feat/landing-page` (a partir de `main`, sem merge até revisão do usuário)
**Status:** aprovado para implementação

## Contexto

Hoje a rota `/` (`src/app/page.tsx`) apenas redireciona: logado → `/home`, deslogado → `/sign-in`. Não existe landing page. O usuário vai escrever todo o texto de marketing depois — este spec cobre só a ESTRUTURA (componentes, layout, arquitetura de conteúdo), com placeholders no lugar de cada texto.

## Comportamento da rota `/`

- **Logado**: continua redirecionando direto pra `/home`, sem mudança.
- **Deslogado**: em vez de redirecionar pra `/sign-in`, renderiza a landing page. Rota `/` já é pública no `proxy.ts` — nenhuma mudança de middleware necessária.
- CTAs da landing: botão principal (hero + CTA final) → `/sign-up`. Link secundário no hero ("Já tenho conta") → `/sign-in`.

## Arquitetura de conteúdo

`src/content/landing.ts`: único arquivo de conteúdo, **100% estático** (nenhum import de `db`/`lib` de domínio) — decisão deliberada para manter o arquivo seguro de editar sem tocar em wiring de dados. Exporta consts tipadas:

```ts
export const SEO = { title, description, ogImagePlaceholder }
export const HERO = { headline, subheadline, ctaLabel, ctaSecondaryLabel }
export const PROBLEMA = { headline, itens: string[] } // 3-4 itens
export const DIFERENCIAL = { headline, paragrafo }
export const FUNCIONALIDADES = [{ titulo, descricao }] // 4 itens: categorias, séries, sons, conquistas
export const INSTALACAO = { headline, ios: { passos: string[] }, android: { passos: string[] } }
export const FAQ = [{ pergunta, resposta }] // 4 pares: denominação, tradução bíblica, gratuidade, privacidade
export const CTA_FINAL = { headline, ctaLabel }
```

Todo texto ainda não escrito usa literal `"[PREENCHER: <descrição do que falta>]"`, específico o bastante pra o usuário saber exatamente o que escrever em cada campo sem precisar abrir o componente visual.

## Estrutura de arquivos

- `src/app/page.tsx` — Server Component. Lógica de auth inalterada pro caso logado; caso deslogado agora renderiza `<LandingPage />` em vez de `redirect("/sign-in")`. `export const metadata` usa `SEO` do content file.
- `src/components/landing/landing-page.tsx` — compõe as seções na ordem abaixo.
- `src/components/landing/hero.tsx`
- `src/components/landing/problema.tsx`
- `src/components/landing/diferencial.tsx`
- `src/components/landing/vitrine.tsx`
- `src/components/landing/como-instalar.tsx`
- `src/components/landing/faq.tsx`
- `src/components/landing/cta-final.tsx`
- `src/components/ui/accordion.tsx` — novo primitivo via `@radix-ui/react-accordion` (nova dependência; mesmo padrão dos outros primitivos Radix já usados no projeto — tabs, dialog, dropdown-menu etc).
- `src/components/ui/reveal.tsx` — wrapper client component reutilizável com `motion`'s `whileInView`, usado da seção 2 em diante pra entrada suave ao rolar.

Cada componente de seção só lê o pedaço do content file que precisa — nenhum componente lê `landing.ts` inteiro.

## Tema e identidade visual

- **Decisão**: a landing é **sempre escura** (navy `#0D0F1C` / dourado `#D4AA5F` / branco-quente `#EDE9E0`), independente do tema claro/escuro que o resto do app segue via `next-themes`.
- **Nota de implementação**: em vez de hardcodar hex nos componentes, forçar o tema escuro na raiz via `forcedTheme` do `next-themes` quando `pathname === "/"` (em `src/components/theme-provider.tsx`) e continuar usando as variáveis CSS já existentes (`var(--gold)`, `var(--bg)`, `var(--text)` etc). Motivo: o Aurora Background (`AnimatedBackground`) usa variantes `dark:` do Tailwind que respondem à classe `.dark` no `<html>` — só sobrescrever cor localmente nos componentes da landing (sem tocar o `<html>`) deixaria o Aurora renderizando no modo claro (gradiente/inversão diferentes) atrás de um conteúdo forçado pra navy, uma inconsistência visual. Forçar o tema no `<html>` resolve os dois de uma vez, sem duplicar cores hardcoded e sem persistir a preferência do usuário no `localStorage` (`forcedTheme` não grava, só sobrescreve a resolução pra aquela renderização).
- Aurora Background: reaproveitar o componente global já existente (`src/components/animated-background.tsx`), em intensidade forte. Adicionar `"/"` ao array `PROMINENT_ROUTES` (hoje `["/sign-in", "/sign-up", "/perfil"]`) — com cuidado: o match usa `pathname?.startsWith(r)`, e `"/".startsWith` casaria com QUALQUER rota, então o caso `"/"` precisa de comparação exata (`pathname === "/"`), não `startsWith`.
- Mobile-first: maioria dos visitantes vem do celular.

## Seções (nesta ordem)

1. **Hero** — headline com reveal palavra-a-palavra (`motion`, adaptado de um componente de hero animado do 21st.dev), subheadline, CTA principal (`/sign-up`) + link secundário (`/sign-in`).
2. **Dor/validação** — headline + 3-4 itens nomeando dificuldades (ansiedade, insônia, distância espiritual).
3. **Diferencial** — headline + parágrafo sobre a base bíblica / Maná Diário como diferencial frente a apps seculares.
4. **Vitrine de funcionalidades** — 4 cards (categorias, séries, sons/músicas, conquistas), cada um com título curto + descrição placeholder. Cards adaptados de um componente de feature-cards do 21st.dev, com hover/entrada elegante.
5. **Como instalar** — tabs iOS/Android via `@radix-ui/react-tabs` (já é dependência do projeto). iOS: Safari → Compartilhar → Adicionar à Tela de Início. Android: Chrome → menu → Instalar app/Adicionar à tela inicial.
6. **FAQ** — accordion Radix (`@radix-ui/react-accordion`, novo) com 4 pares pergunta/resposta placeholder: denominação, tradução bíblica usada, gratuidade, privacidade. Visual adaptado de um accordion do 21st.dev.
7. **CTA final** — repetição do convite, mais simples que o hero, mesmo botão pra `/sign-up`.

## Componentes do 21st.dev

Fonte de estrutura e micro-interações (não substitui o Aurora, que continua sendo a identidade visual do fundo). Abordagem: **adaptação manual** (buscar o componente na 21st.dev, copiar o código-fonte exibido, reescrever usando `cn()` e os tokens de cor fixos da landing) — não via `npx shadcn add`, pelos seguintes motivos:

- O projeto usa Tailwind v4 com config CSS-first (`@theme inline` em `globals.css`), sem `tailwind.config.js`.
- Não existe `components.json` no projeto — a CLI do shadcn não tem onde se ancorar e pode tentar criar/alterar config de um jeito que não bate com o setup atual.
- É o mesmo padrão já usado no projeto: o comentário em `animated-background.tsx` documenta que o Aurora foi "adapted from Aceternity UI's Aurora Background (21st.dev)" — adaptação manual, não instalação via CLI.

Categorias de componente a buscar no 21st.dev: hero com reveal de texto animado, feature cards com hover, accordion, scroll-reveal. **Não usar** categoria "Shaders" (WebGL/3D pesado) — mobile-first, sem prejudicar performance/bateria, e destoa do tom contemplativo do app.

No resumo final da implementação, listar os componentes usados com link de origem no 21st.dev.

## Animação

- `motion` (Framer Motion v12, já instalado) para: reveal do headline do hero, scroll-reveal de cada seção (via `reveal.tsx`), hover dos cards de funcionalidade, micro-interação sutil nos CTAs.
- Accordion do FAQ usa a animação de abertura/fechamento nativa do Radix (CSS-driven).
- Toda animação respeita `prefers-reduced-motion` — mesmo padrão já usado no Aurora (`globals.css`) e no `transcricao-expandivel.tsx` (`useReducedMotion()` do `motion`).

## SEO

- `metadata` no `page.tsx` (Next.js Metadata API) lendo `SEO` do content file: `title`, `description`.
- `openGraph.images`: reaproveitar um `.webp` de categoria já existente como imagem placeholder até o usuário fornecer uma definitiva.

## Fora de escopo (explícito)

- Texto final de qualquer seção — só placeholders.
- Captura de email/newsletter, analytics, formulários adicionais — não mencionados no pedido original.
- Mudança de middleware/`proxy.ts` — rota `/` já é pública.
- Dados dinâmicos do banco (contagem real de séries, sons etc) — a vitrine usa texto estático do content file, não consulta `db`.

## Verificação

- `npm run build` limpo (tsc + lint + build).
- Teste visual local via `npm run dev` acessando `/` deslogado (não depende de chaves de produção do Clerk, só a landing em si).
- Commit + push da branch `feat/landing-page`, preview da Vercel gerado automaticamente.
- Nova seção em `docs/briefing.md` (sem sobrescrever) explicando o caminho do arquivo de conteúdo e como editar o texto depois.

## Plano de implementação

Ver `docs/superpowers/plans/2026-07-15-landing-page.md` (a ser criado via skill `writing-plans`).
