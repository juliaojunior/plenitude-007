import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, CheckCircle2 } from "lucide-react"
import { eq, and } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { series, meditacoes, meditacoesConcluidas } from "@/lib/db/schema"

interface Props {
  params: Promise<{ serieId: string }>
}

export async function generateMetadata({ params }: Props) {
  const { serieId } = await params
  const [serie] = await db.select().from(series).where(eq(series.id, serieId)).limit(1)
  return { title: serie?.titulo ?? "Série" }
}

export default async function SeriePage({ params }: Props) {
  const { serieId } = await params
  const [serie] = await db.select().from(series).where(eq(series.id, serieId)).limit(1)
  if (!serie) notFound()

  const itens = await db
    .select()
    .from(meditacoes)
    .where(eq(meditacoes.serieId, serieId))
    .orderBy(meditacoes.titulo)

  const { userId } = await auth()
  let concluidasIds = new Set<string>()
  if (userId) {
    const rows = await db
      .select({ meditacaoId: meditacoesConcluidas.meditacaoId })
      .from(meditacoesConcluidas)
      .innerJoin(meditacoes, eq(meditacoesConcluidas.meditacaoId, meditacoes.id))
      .where(and(eq(meditacoesConcluidas.userId, userId), eq(meditacoes.serieId, serieId)))
    concluidasIds = new Set(rows.map((r) => r.meditacaoId))
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <Link
        href="/home"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
      >
        <ChevronLeft size={16} /> Início
      </Link>

      <div className="mb-6 flex items-center gap-4">
        <div
          className="h-16 w-16 shrink-0 rounded-2xl shadow-lg shadow-black/30 ring-1 ring-white/10"
          style={{ backgroundColor: serie.cor ?? "var(--bg-card)" }}
        />
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">{serie.titulo}</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {itens.length === 0
              ? "0 meditações"
              : `${concluidasIds.size} de ${itens.length} concluídas`}
          </p>
        </div>
      </div>

      {serie.descricao && (
        <p className="mb-6 text-sm leading-relaxed text-[var(--text-muted)]">{serie.descricao}</p>
      )}

      {itens.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[var(--text-muted)]">Nenhuma meditação ainda.</p>
          <p className="mt-1 text-xs text-[var(--text-faint)]">Em breve novos conteúdos.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {itens.map((item) => {
            const feita = concluidasIds.has(item.id)
            return (
              <Link
                key={item.id}
                href={`/series/${serieId}/${item.id}`}
                className="group flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-all hover:border-[var(--gold)]/40 hover:shadow-md active:scale-[0.99]"
              >
                <div>
                  <p className="font-semibold text-[var(--text)]">{item.titulo}</p>
                  {item.duracaoSegundos && (
                    <p className="mt-2 text-xs text-[var(--text-faint)]">
                      {Math.ceil(item.duracaoSegundos / 60)} min
                    </p>
                  )}
                </div>
                {feita && (
                  <CheckCircle2 size={18} className="shrink-0 text-[var(--gold)]" aria-label="Concluída" />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
