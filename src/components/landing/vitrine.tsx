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
