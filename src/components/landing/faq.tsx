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
