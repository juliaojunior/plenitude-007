import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Play } from "lucide-react"
import { db } from "@/lib/db"
import { favoritos, meditacoes, series } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getCategoria } from "@/lib/categorias"
import { formatDate } from "@/lib/utils"

export const metadata = { title: "Salvas" }

export default async function SalvasPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const lista = await db
    .select({
      favId: favoritos.id,
      savedAt: favoritos.savedAt,
      med: meditacoes,
      serie: series,
    })
    .from(favoritos)
    .innerJoin(meditacoes, eq(favoritos.meditacaoId, meditacoes.id))
    .leftJoin(series, eq(meditacoes.serieId, series.id))
    .where(eq(favoritos.userId, userId))
    .orderBy(favoritos.savedAt)

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-1 text-2xl font-semibold text-[var(--text)]">Salvas</h1>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        {lista.length} meditação{lista.length !== 1 ? "ões" : ""} salva{lista.length !== 1 ? "s" : ""}
      </p>

      {lista.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mb-2 text-4xl">🤍</p>
          <p className="font-medium text-[var(--text)]">Nenhuma salva ainda</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Toque no ♡ em qualquer meditação para salvá-la aqui.
          </p>
          <Link
            href="/meditacoes"
            className="mt-4 inline-block text-sm font-medium text-[var(--gold)] hover:underline"
          >
            Explorar meditações
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {lista.map(({ favId, savedAt, med, serie }) => {
            const cat = med.categoria ? getCategoria(med.categoria) : null
            const label = serie ? serie.titulo : (cat?.label ?? "")
            const cor = serie ? serie.cor : cat?.cor
            const href = serie ? `/series/${serie.id}/${med.id}` : `/meditacoes/${med.categoria}/${med.id}`
            return (
              <div
                key={favId}
                className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
              >
                <div
                  className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full shadow-md shadow-black/30 ring-1 ring-white/10"
                  style={{ backgroundColor: cor ?? "var(--bg-surface)" }}
                >
                  {!serie && cat && (
                    <Image
                      src={`/categorias/${cat.slug}.webp`}
                      alt={cat.label}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text)] truncate">{med.titulo}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: cor ?? undefined }}
                    >
                      {label}
                    </span>
                    {savedAt && (
                      <span className="text-[10px] text-[var(--text-faint)]">
                        · {formatDate(savedAt)}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={href}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-[var(--gold)]/20 hover:text-[var(--gold)] transition-colors"
                  aria-label="Ouvir meditação"
                >
                  <Play size={16} className="ml-0.5" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
