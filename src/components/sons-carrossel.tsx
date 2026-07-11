"use client"

import Link from "next/link"
import Image from "next/image"
import { Carousel } from "@/components/carousel"
import type { sons } from "@/lib/db/schema"

type Som = typeof sons.$inferSelect

export function SonsCarrossel({ sons }: { sons: Som[] }) {
  return (
    <Carousel>
      {sons.map((som) => (
        <Link
          key={som.id}
          href={`/sons/${som.id}`}
          className="group flex w-24 shrink-0 snap-start flex-col items-center gap-2.5 text-center"
        >
          <div
            className="relative flex aspect-square w-24 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-black/30 ring-1 ring-white/10 transition-all duration-300 group-hover:shadow-xl group-hover:ring-[var(--gold)]/50 group-active:scale-95"
            style={{ backgroundColor: som.cor ?? "var(--bg-surface)" }}
          >
            {som.imagem && (
              <Image
                src={som.imagem}
                alt={som.titulo}
                fill
                sizes="96px"
                draggable={false}
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}
          </div>
          <span className="line-clamp-1 text-xs font-medium text-[var(--text)]">{som.titulo}</span>
        </Link>
      ))}
    </Carousel>
  )
}
