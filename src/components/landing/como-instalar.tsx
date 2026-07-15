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
