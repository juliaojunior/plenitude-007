import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { CategoriasCarrossel } from "@/components/categorias-carrossel"
import { SonsCarrossel } from "@/components/sons-carrossel"
import { SeriesGrid } from "@/components/series-grid"
import { todayString } from "@/lib/utils"
import { db } from "@/lib/db"
import { manadiario, sons, series, meditacoes, meditacoesConcluidas } from "@/lib/db/schema"
import { eq, and, count, isNotNull } from "drizzle-orm"

export const revalidate = 3600

async function getManaHoje() {
  try {
    const hoje = todayString()
    const [mana] = await db.select().from(manadiario).where(eq(manadiario.data, hoje)).limit(1)
    return mana ?? null
  } catch {
    return null
  }
}

async function getSons() {
  try {
    return await db.select().from(sons)
  } catch {
    return []
  }
}

async function getSeries(userId: string) {
  try {
    const seriesList = await db.select().from(series)
    if (seriesList.length === 0) return []

    const totais = await db
      .select({ serieId: meditacoes.serieId, total: count() })
      .from(meditacoes)
      .where(isNotNull(meditacoes.serieId))
      .groupBy(meditacoes.serieId)

    const feitas = await db
      .select({ serieId: meditacoes.serieId, feitas: count() })
      .from(meditacoesConcluidas)
      .innerJoin(meditacoes, eq(meditacoesConcluidas.meditacaoId, meditacoes.id))
      .where(and(eq(meditacoesConcluidas.userId, userId), isNotNull(meditacoes.serieId)))
      .groupBy(meditacoes.serieId)

    const totalMap = new Map(totais.map((t) => [t.serieId, t.total]))
    const feitasMap = new Map(feitas.map((f) => [f.serieId, f.feitas]))

    return seriesList.map((s) => ({
      ...s,
      total: totalMap.get(s.id) ?? 0,
      concluidas: feitasMap.get(s.id) ?? 0,
    }))
  } catch {
    return []
  }
}

export default async function HomePage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const nome = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "amigo"

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite"

  const mana = await getManaHoje()
  const sonsList = await getSons()
  const seriesList = await getSeries(userId)

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
            {saudacao}
          </p>
          <h1 className="text-xl font-semibold text-[var(--text)]">{nome}</h1>
        </div>
        <ThemeToggle />
      </div>

      {/* Maná Diário — The Signature Element */}
      <section className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
          Maná Diário
        </p>
        {mana ? (
          <>
            <blockquote className="sacred-text mb-3">
              &ldquo;{mana.textoBiblico}&rdquo;
            </blockquote>
            {mana.referencia && (
              <p className="sacred-ref mb-4">{mana.referencia}</p>
            )}
            {mana.comentario && (
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                {mana.comentario}
              </p>
            )}
          </>
        ) : (
          <>
            <blockquote className="sacred-text mb-3">
              &ldquo;O Senhor é o meu pastor e nada me faltará.&rdquo;
            </blockquote>
            <p className="sacred-ref">Salmos 23:1</p>
          </>
        )}
      </section>

      {/* Categorias */}
      <section className="mb-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Meditar agora
        </h2>
        <CategoriasCarrossel />
      </section>

      {/* Sons */}
      {sonsList.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Sons
          </h2>
          <SonsCarrossel sons={sonsList} />
        </section>
      )}

      {/* Séries */}
      {seriesList.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Séries
          </h2>
          <SeriesGrid series={seriesList} />
        </section>
      )}
    </div>
  )
}
