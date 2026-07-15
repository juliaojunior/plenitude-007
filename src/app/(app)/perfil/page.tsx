import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Bell } from "lucide-react"
import { eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { progressoUsuario, conquistasUsuario, users, series } from "@/lib/db/schema"
import { CONQUISTAS, TIER_COLORS, SERIE_CONQUISTA_PREFIX, type Conquista } from "@/lib/conquistas"
import { getSeries } from "@/lib/series"
import { NomeEditor } from "@/components/nome-editor"
import { AvatarEditor } from "@/components/avatar-editor"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutButton } from "@/components/logout-button"

export const metadata = { title: "Perfil" }

export default async function PerfilPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const clerkUser = await currentUser()

  // Upsert user no banco
  const [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!dbUser) {
    await db.insert(users).values({
      id: userId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? "",
      name: clerkUser?.firstName ?? null,
    }).onConflictDoNothing()
  }

  const [prog] = await db
    .select()
    .from(progressoUsuario)
    .where(eq(progressoUsuario.userId, userId))
    .limit(1)

  const conquistasDesbloqueadas = await db
    .select()
    .from(conquistasUsuario)
    .where(eq(conquistasUsuario.userId, userId))

  const conquistasIds = new Set(conquistasDesbloqueadas.map((c) => c.conquistaId))

  // Conquistas de série são dinâmicas (uma por série concluída) — não vivem em CONQUISTAS.
  const serieIdsCompletas = conquistasDesbloqueadas
    .map((c) => c.conquistaId)
    .filter((id) => id.startsWith(SERIE_CONQUISTA_PREFIX))
    .map((id) => id.slice(SERIE_CONQUISTA_PREFIX.length))
  const seriesCompletas = serieIdsCompletas.length > 0
    ? await db.select().from(series).where(inArray(series.id, serieIdsCompletas))
    : []
  const desbloqueadasSerie: Conquista[] = seriesCompletas.map((s) => ({
    id: `${SERIE_CONQUISTA_PREFIX}${s.id}`,
    titulo: s.titulo,
    descricao: `Série completa: todas as meditações de "${s.titulo}" concluídas`,
    emoji: "🎧",
    tier: "prata",
    criterio: () => true,
  }))

  const desbloqueadas = [...CONQUISTAS.filter((c) => conquistasIds.has(c.id)), ...desbloqueadasSerie]
  const bloqueadas = CONQUISTAS.filter((c) => !conquistasIds.has(c.id)).slice(0, 3)

  const seriesProgresso = await getSeries(userId)
  const seriesConcluidas = seriesProgresso.filter((s) => s.total > 0 && s.concluidas === s.total)
  const seriesEmAndamento = seriesProgresso
    .filter((s) => s.concluidas > 0 && s.concluidas < s.total)
    .slice(0, 3)

  const nomeReal = dbUser?.name ?? clerkUser?.firstName ?? null
  const nome = nomeReal ?? "Adicionar nome"
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? ""

  const stats = [
    { label: "Dias seguidos",   value: prog?.diasConsecutivos ?? 0 },
    { label: "Total",           value: prog?.totalMeditacoes ?? 0 },
    { label: "Minutos",         value: prog?.totalMinutos ?? 0 },
  ]

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--text)]">Perfil</h1>
        <div className="flex items-center gap-1">
          <Link href="/configuracoes/notificacoes" aria-label="Notificações">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-surface)]">
              <Bell size={18} />
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Avatar + nome */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <AvatarEditor userId={userId} initialUrl={dbUser?.avatarUrl ?? null} />
        <NomeEditor initialNome={nome} userId={userId} isPlaceholder={!nomeReal} />
        <p className="text-sm text-[var(--text-muted)]">{email}</p>
      </div>

      {/* Stats */}
      <section className="mb-10">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Sua jornada
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-4"
            >
              <span className="font-display text-3xl font-semibold text-[var(--gold)]">{value}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Progresso de séries */}
      {seriesProgresso.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Progresso de séries
          </h2>
          <div className="flex flex-col gap-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
              <span className="font-display text-2xl font-semibold text-[var(--gold)]">
                {seriesConcluidas.length}
              </span>{" "}
              <span className="text-sm text-[var(--text-muted)]">
                de {seriesProgresso.length} séries concluídas
              </span>
            </div>
            {seriesEmAndamento.map((s) => (
              <Link
                key={s.id}
                href={`/series/${s.id}`}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 transition-colors hover:border-[var(--gold)]/40"
              >
                <span className="text-sm font-medium text-[var(--text)]">{s.titulo}</span>
                <span className="text-xs text-[var(--text-muted)]">{s.concluidas}/{s.total}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Conquistas desbloqueadas */}
      {desbloqueadas.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Conquistas
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {desbloqueadas.map((c) => {
              const colors = TIER_COLORS[c.tier]
              const isSerie = c.id.startsWith(SERIE_CONQUISTA_PREFIX)
              return (
                <div
                  key={c.id}
                  className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-3 ${colors.bg} ${colors.border}`}
                  title={`${c.titulo}: ${c.descricao}`}
                >
                  {isSerie && (
                    <span className="absolute -top-1 -right-1 rounded-full bg-[var(--lavender)] px-1.5 py-0.5 text-[7px] font-semibold text-white">
                      Série
                    </span>
                  )}
                  <span className="text-2xl">{c.emoji}</span>
                  <span className={`text-[9px] font-medium text-center ${colors.text}`}>
                    {c.titulo}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Próximas conquistas */}
      {bloqueadas.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Próximas conquistas
          </h2>
          <div className="flex flex-col gap-2">
            {bloqueadas.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 opacity-60"
              >
                <span className="text-xl grayscale">{c.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{c.titulo}</p>
                  <p className="text-xs text-[var(--text-muted)]">{c.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sair */}
      <section className="mb-8">
        <LogoutButton />
      </section>
    </div>
  )
}
