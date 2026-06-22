import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Bell } from "lucide-react"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { progressoUsuario, conquistasUsuario, users } from "@/lib/db/schema"
import { CONQUISTAS, TIER_COLORS } from "@/lib/conquistas"
import { NomeEditor } from "@/components/nome-editor"
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
  const desbloqueadas = CONQUISTAS.filter((c) => conquistasIds.has(c.id))
  const bloqueadas = CONQUISTAS.filter((c) => !conquistasIds.has(c.id)).slice(0, 3)

  const nome = dbUser?.name ?? clerkUser?.firstName ?? "Usuário"
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
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-surface)] text-4xl border-2 border-[var(--gold)]/30">
          🧘
        </div>
        <NomeEditor initialNome={nome} userId={userId} />
        <p className="text-sm text-[var(--text-muted)]">{email}</p>
      </div>

      {/* Stats */}
      <section className="mb-8">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Sua jornada
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-4"
            >
              <span className="font-display text-3xl font-light text-[var(--gold)]">{value}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Conquistas desbloqueadas */}
      {desbloqueadas.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Conquistas
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {desbloqueadas.map((c) => {
              const colors = TIER_COLORS[c.tier]
              return (
                <div
                  key={c.id}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 ${colors.bg} ${colors.border}`}
                  title={`${c.titulo}: ${c.descricao}`}
                >
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
