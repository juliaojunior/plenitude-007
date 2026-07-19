import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { CategoriasCarrossel } from "@/components/categorias-carrossel"
import { ManaAudioButton } from "@/components/mana-audio-button"
import { ManaShareButton } from "@/components/mana-share-button"
import { SonsCarrossel } from "@/components/sons-carrossel"
import { SeriesGrid } from "@/components/series-grid"
import { todayString } from "@/lib/utils"
import { db } from "@/lib/db"
import { manadiario, sons } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getSeries } from "@/lib/series"

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
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
            Maná Diário
          </p>
          {mana && (
            <div className="flex items-center gap-1">
              {mana.urlAudio && (
                <ManaAudioButton src={mana.urlAudio} titulo={mana.referencia ?? "Maná Diário"} />
              )}
              <ManaShareButton data={mana.data} referencia={mana.referencia ?? "Maná Diário"} />
            </div>
          )}
        </div>
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
