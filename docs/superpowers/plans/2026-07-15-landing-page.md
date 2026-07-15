# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a placeholder-filled landing page shown at `/` to logged-out visitors (logged-in visitors keep redirecting straight to `/home`), with all copy isolated in one content file for the user to fill in later.

**Architecture:** Server Component `src/app/page.tsx` renders `<LandingPage />` (composed of one client/server component per section under `src/components/landing/`) for logged-out visitors. All copy lives in typed consts in `src/content/landing.ts` — no section component contains inline text. Two new shared primitives (`ui/accordion.tsx`, `ui/tabs.tsx`) follow the same hand-rolled shadcn pattern as the existing `ui/button.tsx`/`ui/card.tsx`. The landing forces the app's dark theme regardless of the visitor's system preference via `next-themes`' `forcedTheme`, so both the CSS-variable palette and the Aurora background (which has its own `dark:` Tailwind variants) render consistently.

**Tech Stack:** Next.js 16 App Router, Tailwind v4 (CSS-first config, no `tailwind.config.js`), `motion` (Framer Motion v12, already installed), `@radix-ui/react-tabs` (already installed, unused so far), `@radix-ui/react-accordion` (new dependency), `lucide-react`, `next-themes`.

## Global Constraints

- No test framework exists in this project (no jest/vitest, no `tests/` dir). Verification convention (matches every other `docs/briefing.md` entry) is: `npx tsc --noEmit` (types), `npm run lint` (ESLint), `npm run build` (full build). Use these instead of fabricated unit tests.
- Path alias: `@/*` → `./src/*` (from `tsconfig.json`).
- `cn()` helper: `import { cn } from "@/lib/utils"` (clsx + tailwind-merge).
- Color tokens are CSS variables defined in `src/app/globals.css`: `var(--bg)`, `var(--bg-card)`, `var(--bg-surface)`, `var(--gold)`, `var(--gold-light)`, `var(--text)`, `var(--text-muted)`, `var(--text-faint)`, `var(--border)`, `var(--radius)`. Always use these, never hardcode hex, so components stay consistent with the rest of the app and pick up the forced dark palette automatically.
- All copy in `src/components/landing/*` must come from `src/content/landing.ts` — no inline strings other than structural/decorative text (e.g. an index number), and no data fetched from `db`.
- Every animation must respect `prefers-reduced-motion`: JS-driven `motion` animations must call `useReducedMotion()` from `motion/react` and skip/shortcut motion when true (same pattern as `src/components/transcricao-expandivel.tsx`); pure-CSS transitions/animations are already globally clamped by the `@media (prefers-reduced-motion: reduce)` block in `globals.css` (lines 109-115), so no extra handling needed for those.
- 21st.dev components referenced as structural/interaction inspiration (adapted by hand, not installed via `npx shadcn add` — see spec for why): hero word-reveal inspired by `https://21st.dev/community/components/uniquesonu/animated-hero-section-ui/default`; feature cards inspired by `https://21st.dev/community/components/Codehagen/display-cards/default`; accordion inspired by `https://21st.dev/community/components/skyleen77/radix-accordion`. List these three links in the final summary to the user.

---

### Task 1: Content file — `src/content/landing.ts`

**Files:**
- Create: `src/content/landing.ts`

**Interfaces:**
- Produces: `SEO`, `HERO`, `PROBLEMA`, `DIFERENCIAL`, `FUNCIONALIDADES` (+ type `Funcionalidade`), `INSTALACAO`, `FAQ` (+ type `FaqItem`), `CTA_FINAL` — all consumed by Task 5-11 components and Task 13's `page.tsx`.

- [ ] **Step 1: Write the content file**

```ts
// src/content/landing.ts

export const SEO = {
  title: "[PREENCHER: título de SEO, ~60 caracteres]",
  description: "[PREENCHER: meta description, ~150-160 caracteres]",
  ogImage: "/categorias/paz.webp",
}

export const HERO = {
  headline: "[PREENCHER: headline principal do hero]",
  subheadline: "[PREENCHER: subheadline de apoio, 1-2 frases]",
  ctaLabel: "Criar conta",
  ctaSecondaryLabel: "Já tenho conta",
}

export const PROBLEMA = {
  headline: "[PREENCHER: headline da seção de dor/validação]",
  itens: [
    "[PREENCHER: dor 1 — ex: ansiedade]",
    "[PREENCHER: dor 2 — ex: insônia]",
    "[PREENCHER: dor 3 — ex: distância espiritual]",
    "[PREENCHER: dor 4]",
  ],
}

export const DIFERENCIAL = {
  headline: "[PREENCHER: headline do diferencial]",
  paragrafo:
    "[PREENCHER: parágrafo explicando a base bíblica e o Maná Diário como diferencial frente a apps seculares]",
}

export interface Funcionalidade {
  icone: "categorias" | "series" | "sons" | "conquistas"
  titulo: string
  descricao: string
}

export const FUNCIONALIDADES: Funcionalidade[] = [
  {
    icone: "categorias",
    titulo: "[PREENCHER: título — categorias]",
    descricao: "[PREENCHER: descrição curta — 9 categorias de meditação]",
  },
  {
    icone: "series",
    titulo: "[PREENCHER: título — séries]",
    descricao: "[PREENCHER: descrição curta — progressão em séries]",
  },
  {
    icone: "sons",
    titulo: "[PREENCHER: título — sons]",
    descricao: "[PREENCHER: descrição curta — sons e músicas ambiente]",
  },
  {
    icone: "conquistas",
    titulo: "[PREENCHER: título — conquistas]",
    descricao: "[PREENCHER: descrição curta — sistema de conquistas]",
  },
]

export const INSTALACAO = {
  headline: "[PREENCHER: headline da seção de instalação]",
  ios: {
    label: "iPhone (Safari)",
    passos: [
      "[PREENCHER: passo 1 iOS — ex: abra o site no Safari]",
      "[PREENCHER: passo 2 iOS — ex: toque em Compartilhar]",
      "[PREENCHER: passo 3 iOS — ex: toque em Adicionar à Tela de Início]",
    ],
  },
  android: {
    label: "Android (Chrome)",
    passos: [
      "[PREENCHER: passo 1 Android — ex: abra o site no Chrome]",
      "[PREENCHER: passo 2 Android — ex: toque no menu (⋮)]",
      "[PREENCHER: passo 3 Android — ex: toque em Instalar app]",
    ],
  },
}

export interface FaqItem {
  pergunta: string
  resposta: string
}

export const FAQ: { headline: string; itens: FaqItem[] } = {
  headline: "[PREENCHER: headline do FAQ — ex: Perguntas frequentes]",
  itens: [
    { pergunta: "[PERGUNTA 1 — denominação]", resposta: "[RESPOSTA 1]" },
    { pergunta: "[PERGUNTA 2 — tradução bíblica usada]", resposta: "[RESPOSTA 2]" },
    { pergunta: "[PERGUNTA 3 — gratuidade]", resposta: "[RESPOSTA 3]" },
    { pergunta: "[PERGUNTA 4 — privacidade]", resposta: "[RESPOSTA 4]" },
  ],
}

export const CTA_FINAL = {
  headline: "[PREENCHER: headline do CTA final]",
  ctaLabel: "Criar conta",
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `src/content/landing.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/content/landing.ts
git commit -m "feat(landing): add placeholder content file"
```

---

### Task 2: `src/components/ui/reveal.tsx` — scroll-reveal wrapper

**Files:**
- Create: `src/components/ui/reveal.tsx`

**Interfaces:**
- Produces: `Reveal` component — `<Reveal delay?: number>{children}</Reveal>`. Consumed by Task 6, 7, 8, 9, 10.

- [ ] **Step 1: Write the component**

```tsx
// src/components/ui/reveal.tsx
"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <>{children}</>

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `src/components/ui/reveal.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/reveal.tsx
git commit -m "feat(landing): add Reveal scroll-in-view wrapper"
```

---

### Task 3: `src/components/ui/accordion.tsx` — Radix accordion primitive

**Files:**
- Create: `src/components/ui/accordion.tsx`
- Modify: `package.json` (new dependency, via `npm install`)
- Modify: `src/app/globals.css:32-51` (add accordion keyframes inside the existing `@theme inline` block)

**Interfaces:**
- Produces: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`. Consumed by Task 9 (`faq.tsx`).

- [ ] **Step 1: Install the dependency**

```bash
npm install @radix-ui/react-accordion
```

Expected: `package.json` gains a `"@radix-ui/react-accordion": "^1.2.x"` line under `dependencies`.

- [ ] **Step 2: Add accordion keyframes to `globals.css`**

In `src/app/globals.css`, inside the existing `@theme inline { ... }` block (the one that already defines `--animate-aurora` and its `@keyframes aurora`), add two more animation registrations right after the `aurora` keyframes block (still inside `@theme inline`, before the closing `}` at line 51):

```css
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up:   accordion-up 0.2s ease-out;
  @keyframes accordion-down {
    from { height: 0; }
    to   { height: var(--radix-accordion-content-height); }
  }
  @keyframes accordion-up {
    from { height: var(--radix-accordion-content-height); }
    to   { height: 0; }
  }
```

- [ ] **Step 3: Write the primitive**

```tsx
// src/components/ui/accordion.tsx
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b border-[var(--border)]", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-left text-sm font-medium text-[var(--text)] transition-all [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm text-[var(--text-muted)] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `src/components/ui/accordion.tsx`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/components/ui/accordion.tsx src/app/globals.css
git commit -m "feat(landing): add Accordion primitive (@radix-ui/react-accordion)"
```

---

### Task 4: `src/components/ui/tabs.tsx` — Radix tabs primitive

**Files:**
- Create: `src/components/ui/tabs.tsx`

**Interfaces:**
- Produces: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`. Consumed by Task 8 (`como-instalar.tsx`).
- Consumes: `@radix-ui/react-tabs` (already a dependency — confirmed in `package.json`, `^1.1.15` — not previously used anywhere in the codebase, no install step needed).

- [ ] **Step 1: Write the primitive**

```tsx
// src/components/ui/tabs.tsx
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-[var(--radius)] bg-[var(--bg-surface)] p-1",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-[calc(var(--radius)-0.25rem)] px-4 py-2 text-sm font-medium text-[var(--text-muted)] transition-all data-[state=active]:bg-[var(--gold)] data-[state=active]:font-semibold data-[state=active]:text-[#0D0F1C]",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-4 focus-visible:outline-none", className)}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `src/components/ui/tabs.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/tabs.tsx
git commit -m "feat(landing): add Tabs primitive"
```

---

### Task 5: `src/components/landing/hero.tsx`

**Files:**
- Create: `src/components/landing/hero.tsx`

**Interfaces:**
- Consumes: `HERO` from `@/content/landing` (Task 1); `Button` from `@/components/ui/button` (existing, unchanged).
- Produces: `Hero` component (no props). Consumed by Task 11 (`landing-page.tsx`).

- [ ] **Step 1: Write the component**

```tsx
// src/components/landing/hero.tsx
"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { HERO } from "@/content/landing"

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const word = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}

export function Hero() {
  const reduceMotion = useReducedMotion()
  const words = HERO.headline.split(" ")

  return (
    <section className="flex min-h-[90vh] flex-col items-center justify-center gap-6 px-6 text-center">
      {reduceMotion ? (
        <h1 className="font-display max-w-3xl text-4xl font-light text-[var(--text)] sm:text-5xl">
          {HERO.headline}
        </h1>
      ) : (
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={container}
          className="font-display max-w-3xl text-4xl font-light text-[var(--text)] sm:text-5xl"
        >
          {words.map((w, i) => (
            <motion.span key={i} variants={word} className="mr-[0.25em] inline-block">
              {w}
            </motion.span>
          ))}
        </motion.h1>
      )}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.6 }}
        className="max-w-xl text-base text-[var(--text-muted)] sm:text-lg"
      >
        {HERO.subheadline}
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.9 }}
        className="flex flex-col items-center gap-3 sm:flex-row"
      >
        <Button asChild size="lg">
          <Link href="/sign-up">{HERO.ctaLabel}</Link>
        </Button>
        <Link
          href="/sign-in"
          className="text-sm text-[var(--text-muted)] underline-offset-4 hover:text-[var(--text)] hover:underline"
        >
          {HERO.ctaSecondaryLabel}
        </Link>
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `src/components/landing/hero.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/hero.tsx
git commit -m "feat(landing): add Hero section with word-stagger reveal"
```

---

### Task 6: `src/components/landing/problema.tsx` and `src/components/landing/diferencial.tsx`

**Files:**
- Create: `src/components/landing/problema.tsx`
- Create: `src/components/landing/diferencial.tsx`

**Interfaces:**
- Consumes: `PROBLEMA`, `DIFERENCIAL` from `@/content/landing` (Task 1); `Reveal` from `@/components/ui/reveal` (Task 2).
- Produces: `Problema`, `Diferencial` components (no props). Consumed by Task 11.

- [ ] **Step 1: Write `problema.tsx`**

```tsx
// src/components/landing/problema.tsx
import { Reveal } from "@/components/ui/reveal"
import { PROBLEMA } from "@/content/landing"

export function Problema() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <Reveal>
        <h2 className="font-display text-2xl font-light text-[var(--text)] sm:text-3xl">
          {PROBLEMA.headline}
        </h2>
        <ul className="mt-8 grid gap-4 text-left sm:grid-cols-2">
          {PROBLEMA.itens.map((item, i) => (
            <li
              key={i}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-4 text-sm text-[var(--text-muted)]"
            >
              {item}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 2: Write `diferencial.tsx`**

```tsx
// src/components/landing/diferencial.tsx
import { Reveal } from "@/components/ui/reveal"
import { DIFERENCIAL } from "@/content/landing"

export function Diferencial() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20 text-center">
      <Reveal>
        <h2 className="font-display text-2xl font-light text-[var(--text)] sm:text-3xl">
          {DIFERENCIAL.headline}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">
          {DIFERENCIAL.paragrafo}
        </p>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors mentioning either new file.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/problema.tsx src/components/landing/diferencial.tsx
git commit -m "feat(landing): add Problema and Diferencial sections"
```

---

### Task 7: `src/components/landing/vitrine.tsx`

**Files:**
- Create: `src/components/landing/vitrine.tsx`

**Interfaces:**
- Consumes: `FUNCIONALIDADES`, `Funcionalidade` type from `@/content/landing` (Task 1); `Reveal` from `@/components/ui/reveal` (Task 2).
- Produces: `Vitrine` component (no props). Consumed by Task 11.

- [ ] **Step 1: Write the component**

```tsx
// src/components/landing/vitrine.tsx
"use client"

import { motion } from "motion/react"
import { Compass, Layers, Music, Award, type LucideIcon } from "lucide-react"
import { Reveal } from "@/components/ui/reveal"
import { FUNCIONALIDADES, type Funcionalidade } from "@/content/landing"

const ICONES: Record<Funcionalidade["icone"], LucideIcon> = {
  categorias: Compass,
  series: Layers,
  sons: Music,
  conquistas: Award,
}

export function Vitrine() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FUNCIONALIDADES.map((item) => {
            const Icon = ICONES[item.icone]
            return (
              <motion.div
                key={item.icone}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center"
              >
                <Icon className="mx-auto h-8 w-8 text-[var(--gold)]" />
                <h3 className="mt-4 text-sm font-semibold text-[var(--text)]">{item.titulo}</h3>
                <p className="mt-2 text-xs text-[var(--text-muted)]">{item.descricao}</p>
              </motion.div>
            )
          })}
        </div>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `src/components/landing/vitrine.tsx` (confirms `Compass`/`Layers`/`Music`/`Award`/`LucideIcon` all exist in the installed `lucide-react` version).

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/vitrine.tsx
git commit -m "feat(landing): add Vitrine feature-cards section"
```

---

### Task 8: `src/components/landing/como-instalar.tsx`

**Files:**
- Create: `src/components/landing/como-instalar.tsx`

**Interfaces:**
- Consumes: `INSTALACAO` from `@/content/landing` (Task 1); `Reveal` from `@/components/ui/reveal` (Task 2); `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/components/ui/tabs` (Task 4).
- Produces: `ComoInstalar` component (no props). Consumed by Task 11.

- [ ] **Step 1: Write the component**

```tsx
// src/components/landing/como-instalar.tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Reveal } from "@/components/ui/reveal"
import { INSTALACAO } from "@/content/landing"

export function ComoInstalar() {
  return (
    <section className="mx-auto max-w-xl px-6 py-20 text-center">
      <Reveal>
        <h2 className="font-display text-2xl font-light text-[var(--text)] sm:text-3xl">
          {INSTALACAO.headline}
        </h2>
        <Tabs defaultValue="ios" className="mt-8 flex flex-col items-center">
          <TabsList>
            <TabsTrigger value="ios">{INSTALACAO.ios.label}</TabsTrigger>
            <TabsTrigger value="android">{INSTALACAO.android.label}</TabsTrigger>
          </TabsList>
          <TabsContent value="ios" className="w-full text-left">
            <ol className="space-y-3">
              {INSTALACAO.ios.passos.map((passo, i) => (
                <li key={i} className="flex gap-3 text-sm text-[var(--text-muted)]">
                  <span className="font-display text-[var(--gold)]">{i + 1}.</span>
                  {passo}
                </li>
              ))}
            </ol>
          </TabsContent>
          <TabsContent value="android" className="w-full text-left">
            <ol className="space-y-3">
              {INSTALACAO.android.passos.map((passo, i) => (
                <li key={i} className="flex gap-3 text-sm text-[var(--text-muted)]">
                  <span className="font-display text-[var(--gold)]">{i + 1}.</span>
                  {passo}
                </li>
              ))}
            </ol>
          </TabsContent>
        </Tabs>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `src/components/landing/como-instalar.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/como-instalar.tsx
git commit -m "feat(landing): add ComoInstalar iOS/Android tabs section"
```

---

### Task 9: `src/components/landing/faq.tsx`

**Files:**
- Create: `src/components/landing/faq.tsx`

**Interfaces:**
- Consumes: `FAQ` from `@/content/landing` (Task 1); `Reveal` from `@/components/ui/reveal` (Task 2); `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` from `@/components/ui/accordion` (Task 3).
- Produces: `Faq` component (no props). Consumed by Task 11.

- [ ] **Step 1: Write the component**

```tsx
// src/components/landing/faq.tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Reveal } from "@/components/ui/reveal"
import { FAQ } from "@/content/landing"

export function Faq() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <Reveal>
        <h2 className="font-display text-center text-2xl font-light text-[var(--text)] sm:text-3xl">
          {FAQ.headline}
        </h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQ.itens.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.pergunta}</AccordionTrigger>
              <AccordionContent>{item.resposta}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `src/components/landing/faq.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/faq.tsx
git commit -m "feat(landing): add Faq accordion section"
```

---

### Task 10: `src/components/landing/cta-final.tsx`

**Files:**
- Create: `src/components/landing/cta-final.tsx`

**Interfaces:**
- Consumes: `CTA_FINAL` from `@/content/landing` (Task 1); `Reveal` from `@/components/ui/reveal` (Task 2); `Button` from `@/components/ui/button` (existing).
- Produces: `CtaFinal` component (no props). Consumed by Task 11.

- [ ] **Step 1: Write the component**

```tsx
// src/components/landing/cta-final.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/ui/reveal"
import { CTA_FINAL } from "@/content/landing"

export function CtaFinal() {
  return (
    <section className="mx-auto max-w-xl px-6 py-24 text-center">
      <Reveal>
        <h2 className="font-display text-2xl font-light text-[var(--text)] sm:text-3xl">
          {CTA_FINAL.headline}
        </h2>
        <Button asChild size="lg" className="mt-6">
          <Link href="/sign-up">{CTA_FINAL.ctaLabel}</Link>
        </Button>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `src/components/landing/cta-final.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/cta-final.tsx
git commit -m "feat(landing): add final CTA section"
```

---

### Task 11: `src/components/landing/landing-page.tsx` — compose all sections

**Files:**
- Create: `src/components/landing/landing-page.tsx`

**Interfaces:**
- Consumes: `Hero` (Task 5), `Problema`/`Diferencial` (Task 6), `Vitrine` (Task 7), `ComoInstalar` (Task 8), `Faq` (Task 9), `CtaFinal` (Task 10).
- Produces: `LandingPage` component (no props). Consumed by Task 13 (`app/page.tsx`).

- [ ] **Step 1: Write the component**

```tsx
// src/components/landing/landing-page.tsx
import { Hero } from "@/components/landing/hero"
import { Problema } from "@/components/landing/problema"
import { Diferencial } from "@/components/landing/diferencial"
import { Vitrine } from "@/components/landing/vitrine"
import { ComoInstalar } from "@/components/landing/como-instalar"
import { Faq } from "@/components/landing/faq"
import { CtaFinal } from "@/components/landing/cta-final"

export function LandingPage() {
  return (
    <div>
      <Hero />
      <Problema />
      <Diferencial />
      <Vitrine />
      <ComoInstalar />
      <Faq />
      <CtaFinal />
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `src/components/landing/landing-page.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/landing-page.tsx
git commit -m "feat(landing): compose LandingPage from all sections"
```

---

### Task 12: Force dark theme on `/` and make Aurora prominent there

**Files:**
- Modify: `src/components/theme-provider.tsx`
- Modify: `src/components/animated-background.tsx:16` and `:20`

**Interfaces:**
- No new exports; both files keep their existing exported component names (`ThemeProvider`, `AnimatedBackground`) and prop shapes unchanged.

- [ ] **Step 1: Modify `theme-provider.tsx` to force dark theme on `/`**

Replace the full contents of `src/components/theme-provider.tsx`:

```tsx
"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname()
  const forcedTheme = pathname === "/" ? "dark" : undefined

  return (
    <NextThemesProvider {...props} forcedTheme={forcedTheme}>
      {children}
    </NextThemesProvider>
  )
}
```

This only affects the root route: logged-in users never render `/` (the Server Component in `page.tsx` redirects them to `/home` before any client rendering happens), so this cannot force dark theme on any authenticated screen. `forcedTheme` overrides the resolved theme for this render only — it does not touch `localStorage`, so the visitor's actual stored preference (used everywhere else in the app) is untouched.

- [ ] **Step 2: Fix `PROMINENT_ROUTES` matching in `animated-background.tsx`**

In `src/components/animated-background.tsx`, the current code is:

```tsx
const PROMINENT_ROUTES = ["/sign-in", "/sign-up", "/perfil"]
```//... later:
```tsx
  const prominent = PROMINENT_ROUTES.some((r) => pathname?.startsWith(r))
```

Change line 16 to add `"/"` to the array:

```tsx
const PROMINENT_ROUTES = ["/", "/sign-in", "/sign-up", "/perfil"]
```

And change line 20 (the `prominent` computation) — **do not** use plain `startsWith` for `"/"`, since every pathname starts with `/` and that would make every route "prominent":

```tsx
  const prominent = PROMINENT_ROUTES.some((r) => (r === "/" ? pathname === "/" : pathname?.startsWith(r)))
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors mentioning either modified file.

- [ ] **Step 4: Manual sanity check of the route-matching fix**

Run: `node -e '
const PROMINENT_ROUTES = ["/", "/sign-in", "/sign-up", "/perfil"];
const check = (pathname) => PROMINENT_ROUTES.some((r) => (r === "/" ? pathname === "/" : pathname?.startsWith(r)));
console.log("/", check("/"));               // expect true
console.log("/home", check("/home"));       // expect false
console.log("/sign-in", check("/sign-in")); // expect true
console.log("/meditacoes/paz/med-paz-1", check("/meditacoes/paz/med-paz-1")); // expect false
'`

Expected output:
```
/ true
/home false
/sign-in true
/meditacoes/paz/med-paz-1 false
```

- [ ] **Step 5: Commit**

```bash
git add src/components/theme-provider.tsx src/components/animated-background.tsx
git commit -m "feat(landing): force dark theme and prominent Aurora on /"
```

---

### Task 13: Wire up `src/app/page.tsx`

**Files:**
- Modify: `src/app/page.tsx` (full rewrite — currently 9 lines)

**Interfaces:**
- Consumes: `LandingPage` from `@/components/landing/landing-page` (Task 11); `SEO` from `@/content/landing` (Task 1).

- [ ] **Step 1: Rewrite `page.tsx`**

Replace the full contents of `src/app/page.tsx`:

```tsx
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"
import { LandingPage } from "@/components/landing/landing-page"
import { SEO } from "@/content/landing"

export const metadata: Metadata = {
  title: SEO.title,
  description: SEO.description,
  openGraph: {
    title: SEO.title,
    description: SEO.description,
    images: [{ url: SEO.ogImage }],
  },
}

export default async function RootPage() {
  const { userId } = await auth()
  if (userId) redirect("/home")
  return <LandingPage />
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `src/app/page.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(landing): render LandingPage at / for logged-out visitors"
```

---

### Task 14: Full verification, docs, and push

**Files:**
- Modify: `docs/briefing.md` (append new section, do not overwrite existing content)

- [ ] **Step 1: Full typecheck**

Run: `npx tsc --noEmit`
Expected: exits with no output and status 0.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors (pre-existing warnings unrelated to this change, if any, are acceptable — matches project convention documented in `docs/briefing.md`'s security-update entry).

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build completes successfully, and the route list in the build output includes `/` as a route (confirms it compiled, not just that the old redirect-only version built).

- [ ] **Step 4: Manual check with the dev server**

Run: `npm run dev` (in the background or a separate terminal), then in a browser or via `curl -s http://localhost:3000/ | grep -o '<h1[^<]*'` confirm:
- The page renders without throwing (no 500).
- The hero placeholder headline text (`[PREENCHER: headline principal do hero]`) appears in the HTML — confirms the content file is wired through, not a hardcoded string.
- `/sign-in` and `/sign-up` links exist in the rendered HTML (`grep -o 'href="/sign-\(in\|up\)"'`).

This does not require production Clerk keys (unlike the rest of the app) since the landing itself renders before any Clerk UI loads — only the two link hrefs need to be present.

- [ ] **Step 5: Append the `docs/briefing.md` section**

Append this section to the end of `docs/briefing.md` (the file's own header says "Não sobrescrever seções existentes — sempre acrescentar", so add after the last existing section, do not touch anything above it):

```markdown
## Landing page — estrutura (2026-07-15)

**Branch:** `feat/landing-page` (a partir de `main`, sem merge — aguardando o usuário escrever o texto real e revisar).

Rota `/` agora mostra uma landing page pra visitantes deslogados (antes redirecionava direto pra `/sign-in`). Logado continua indo direto pra `/home`, sem mudança.

**Onde editar o texto:** todo o conteúdo (headlines, parágrafos, perguntas/respostas do FAQ, meta tags de SEO) fica em **`src/content/landing.ts`** — um arquivo só, sem nenhum texto espalhado nos componentes visuais. Cada campo ainda não escrito tem um placeholder `"[PREENCHER: ...]"` dizendo exatamente o que falta. Basta editar as strings nesse arquivo; nenhuma mudança de componente é necessária pra trocar o texto.

**Estrutura visual:** 7 seções em `src/components/landing/` (hero, problema, diferencial, vitrine, como-instalar, faq, cta-final), compostas em `landing-page.tsx`. Novos primitivos reutilizáveis em `src/components/ui/`: `accordion.tsx` (novo, via `@radix-ui/react-accordion`) e `tabs.tsx` (novo wrapper, mas a dependência `@radix-ui/react-tabs` já estava no `package.json` sem uso).

**Tema sempre escuro:** a landing força o tema escuro do app independente da preferência do visitante (`src/components/theme-provider.tsx` agora usa `forcedTheme="dark"` do `next-themes` quando `pathname === "/"`) — isso também resolvia uma inconsistência: o Aurora Background usa variantes `dark:` do Tailwind amarradas à classe no `<html>`, então só sobrescrever cor localmente nos componentes da landing deixaria o Aurora renderizando errado atrás do conteúdo. `PROMINENT_ROUTES` em `animated-background.tsx` ganhou `"/"` pra intensidade forte igual ao `/sign-in` (com cuidado: o match precisou de comparação exata pra `"/"`, não `startsWith`, senão toda rota do app viraria "prominent").

**Componentes do 21st.dev usados como referência estrutural** (adaptados à mão, não instalados via CLI — motivo documentado no spec): hero com reveal de palavra a palavra (inspirado em https://21st.dev/community/components/uniquesonu/animated-hero-section-ui/default), cards de funcionalidade com hover (inspirado em https://21st.dev/community/components/Codehagen/display-cards/default), accordion do FAQ (inspirado em https://21st.dev/community/components/skyleen77/radix-accordion).

**Fora do escopo (de propósito):** texto final de qualquer seção, captura de e-mail/newsletter, analytics, dados dinâmicos do banco na vitrine (usa texto estático do content file).

**Spec completo:** `docs/superpowers/specs/2026-07-15-landing-page-design.md`.
```

- [ ] **Step 6: Commit the docs update**

```bash
git add docs/briefing.md
git commit -m "docs: document landing page content file location"
```

- [ ] **Step 7: Push the branch**

```bash
git push -u origin feat/landing-page
```

Expected: push succeeds, Vercel preview deployment triggers automatically (per this project's standard workflow — every branch gets a preview URL).

- [ ] **Step 8: Stop for user review**

Per the original request: do not merge, do not delete the branch. Report back: the branch name, the preview URL (once Vercel posts it, e.g. via the GitHub PR check or `vercel ls`), the exact path to `src/content/landing.ts`, and the three 21st.dev links used for structural reference.

---

## Self-Review

**Spec coverage:**
- Route behavior (logged-in unchanged, logged-out sees landing) → Task 13. ✓
- Single content file, all copy isolated, explicit placeholders → Task 1. ✓
- File-per-section structure under `src/components/landing/` → Tasks 5-11. ✓
- All 7 sections in the specified order → Task 11 composes them in that exact order. ✓
- Fixed dark navy identity regardless of system theme → Task 12 (`forcedTheme`), using existing CSS var tokens (not hardcoded hex) in every section component (Tasks 5-10). ✓
- Aurora reused at hero-level intensity → Task 12 Step 2. ✓
- Mobile-first → all section components use `px-6`, `max-w-*`, `grid`/`flex` with responsive breakpoints (`sm:`, `lg:`) starting from a single-column mobile base. ✓
- 21st.dev as structural/micro-interaction source, adapted manually, no CLI, no shaders → Global Constraints + Tasks 3, 5, 7 (accordion, hero reveal, feature cards), with links. ✓
- Accordion for FAQ, tabs for install guide → Tasks 3/9 and 4/8. ✓
- Scroll-reveal on sections → `Reveal` (Task 2), used in Tasks 6, 7, 8, 9, 10 (not Hero, which has its own entrance animation per spec's word-reveal requirement). ✓
- `prefers-reduced-motion` respected → Global Constraints note + explicit `useReducedMotion()` checks in Task 5 (Hero) and Task 2 (Reveal, used by every other section). ✓
- SEO title/description + OG image placeholder → Task 1 (`SEO` export) + Task 13 (`metadata`). ✓
- `npm run build` clean → Task 14 Step 3. ✓
- Branch `feat/landing-page`, no merge, push for preview → branch created before Task 1 (see note below), Task 14 Steps 7-8. ✓
- `docs/briefing.md` new section, not overwritten → Task 14 Step 5. ✓
- Summary listing 21st.dev components with links → Task 14 Step 8 + Global Constraints. ✓

**Note on branch creation:** the branch `feat/landing-page` was already created (from `main`) during the brainstorming phase, before this plan was written, per the user's explicit "Passo 0" instruction. Whoever executes this plan should confirm they're on that branch (`git branch --show-current`) before Task 1 rather than creating it again.

**Placeholder scan:** no "TBD"/"TODO"/"implement later" found; every code step has complete, runnable code; every content field has a real, specific `[PREENCHER: ...]` string naming exactly what's missing, not a generic placeholder.

**Type consistency:** `Funcionalidade["icone"]` union (`"categorias" | "series" | "sons" | "conquistas"`) defined in Task 1 matches the `ICONES` record keys in Task 7 exactly. `FaqItem` shape (`{ pergunta, resposta }`) defined in Task 1 matches the `.itens.map` destructuring in Task 9. Component names exported in Tasks 2-10 (`Reveal`, `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent`, `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`, `Hero`, `Problema`, `Diferencial`, `Vitrine`, `ComoInstalar`, `Faq`, `CtaFinal`) match their import names in Task 11 exactly.