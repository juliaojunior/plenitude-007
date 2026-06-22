import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Play } from "lucide-react"
import { db } from "@/lib/db"
import { favoritos, meditacoes } from "@/lib/db/schema"
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
    })
    .from(favoritos)
    .innerJoin(meditacoes, eq(favoritos.meditacaoId, meditacoes.id))
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
          {lista.map(({ favId, savedAt, med }) => {
            const cat = getCategoria(med.categoria)
            return (
              <div
                key={favId}
                className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ backgroundColor: cat.cor + "25" }}
                >
                  {cat.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text)] truncate">{med.titulo}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: cat.cor }}
                    >
                      {cat.label}
                    </span>
                    {savedAt && (
                      <span className="text-[10px] text-[var(--text-faint)]">
                        · {formatDate(savedAt)}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/meditacoes/${med.categoria}/${med.id}`}
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
