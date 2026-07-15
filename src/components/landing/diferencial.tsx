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
