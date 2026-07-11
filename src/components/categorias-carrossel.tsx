"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { CATEGORIAS } from "@/lib/categorias"
import { Carousel } from "@/components/carousel"

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function CategoriasCarrossel() {
  // Server-rendered in original order to avoid a hydration mismatch;
  // shuffled client-side right after mount so order is fresh per load.
  const [ordem, setOrdem] = useState<typeof CATEGORIAS extends readonly (infer T)[] ? T[] : never>([...CATEGORIAS])
  // Shuffles only after hydration so server and client render the same initial
  // order first (avoids a hydration mismatch), then randomizes on the client.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrdem(shuffle(CATEGORIAS))
  }, [])

  return (
    <Carousel>
      {ordem.map((cat) => (
        <Link
          key={cat.slug}
          href={`/meditacoes/${cat.slug}`}
          className="group flex w-24 shrink-0 snap-start flex-col items-center gap-2.5 text-center"
        >
          <div className="relative aspect-square w-24 overflow-hidden rounded-full shadow-lg shadow-black/30 ring-1 ring-white/10 transition-all duration-300 group-hover:shadow-xl group-hover:ring-[var(--gold)]/50 group-active:scale-95">
            <Image
              src={`/categorias/${cat.slug}.webp`}
              alt={cat.label}
              fill
              sizes="96px"
              draggable={false}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <span className="text-xs font-medium text-[var(--text)]">{cat.label}</span>
        </Link>
      ))}
    </Carousel>
  )
}
