"use client"

import Link from "next/link"
import Image from "next/image"
import type { series } from "@/lib/db/schema"

type Serie = typeof series.$inferSelect & { total: number; concluidas: number }

export function SeriesGrid({ series }: { series: Serie[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {series.map((serie) => (
        <Link key={serie.id} href={`/series/${serie.id}`} className="group flex flex-col gap-1.5">
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)] shadow-lg shadow-black/20 ring-1 ring-white/10 transition-all duration-300 group-hover:shadow-xl group-hover:ring-[var(--gold)]/50 group-active:scale-95"
            style={{ backgroundColor: serie.cor ?? "var(--bg-card)" }}
          >
            {serie.imagem && (
              <Image
                src={serie.imagem}
                alt={serie.titulo}
                fill
                sizes="33vw"
                draggable={false}
                className="object-cover"
              />
            )}
          </div>
          <div className="text-center">
            <span className="block text-xs font-medium leading-tight text-[var(--text)] line-clamp-2">
              {serie.titulo}
            </span>
            {serie.total > 0 && (
              <span className="block text-[10px] text-[var(--text)]/70">
                {serie.concluidas}/{serie.total}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
