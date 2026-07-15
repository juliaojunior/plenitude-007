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
