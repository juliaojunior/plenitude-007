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
