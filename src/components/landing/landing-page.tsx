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
