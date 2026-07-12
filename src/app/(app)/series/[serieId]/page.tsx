import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { series, meditacoes } from "@/lib/db/schema"

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
            {itens.length} {itens.length === 1 ? "meditação" : "meditações"}
          </p>
        </div>
      </div>

      {itens.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[var(--text-muted)]">Nenhuma meditação ainda.</p>
          <p className="mt-1 text-xs text-[var(--text-faint)]">Em breve novos conteúdos.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {itens.map((item) => (
            <Link
              key={item.id}
              href={`/series/${serieId}/${item.id}`}
              className="group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-all hover:border-[var(--gold)]/40 hover:shadow-md active:scale-[0.99]"
            >
              <p className="font-semibold text-[var(--text)]">{item.titulo}</p>
              {item.duracaoSegundos && (
                <p className="mt-2 text-xs text-[var(--text-faint)]">
                  {Math.ceil(item.duracaoSegundos / 60)} min
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
