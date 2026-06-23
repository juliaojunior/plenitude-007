import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { CATEGORIAS } from "@/lib/categorias"
import { todayString } from "@/lib/utils"
import { db } from "@/lib/db"
import { manadiario } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

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

export default async function HomePage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const nome = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "amigo"

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite"

  const mana = await getManaHoje()

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
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Meditar agora
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {CATEGORIAS.map((cat) => (
            <Link
              key={cat.slug}
              href={`/meditacoes/${cat.slug}`}
              className="group flex flex-col items-center gap-2.5 text-center"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-full shadow-lg shadow-black/30 ring-1 ring-white/10 transition-all duration-300 group-hover:shadow-xl group-hover:ring-[var(--gold)]/50 group-active:scale-95">
                <Image
                  src={`/categorias/${cat.slug}.webp`}
                  alt={cat.label}
                  fill
                  sizes="(max-width: 512px) 30vw, 150px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <span className="text-xs font-medium text-[var(--text)]">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
