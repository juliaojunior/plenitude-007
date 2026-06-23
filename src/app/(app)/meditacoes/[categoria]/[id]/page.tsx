import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft } from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { meditacoes, favoritos } from "@/lib/db/schema"
import { getCategoria, CATEGORIAS } from "@/lib/categorias"
import { FavoritoButton } from "@/components/favorito-button"
import { AudioPlayer } from "@/components/audio-player"

interface Props {
  params: Promise<{ categoria: string; id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const [med] = await db.select().from(meditacoes).where(eq(meditacoes.id, id)).limit(1)
  return { title: med?.titulo ?? "Meditação" }
}

export default async function MeditacaoPage({ params }: Props) {
  const { categoria, id } = await params
  const cat = getCategoria(categoria)
  if (!CATEGORIAS.find((c) => c.slug === categoria)) notFound()

  const [med] = await db.select().from(meditacoes).where(eq(meditacoes.id, id)).limit(1)
  if (!med) notFound()

  const { userId } = await auth()
  let isFavorito = false
  if (userId) {
    const [fav] = await db
      .select()
      .from(favoritos)
      .where(and(eq(favoritos.userId, userId), eq(favoritos.meditacaoId, id)))
      .limit(1)
    isFavorito = !!fav
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      {/* Nav */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/meditacoes/${categoria}`}
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <ChevronLeft size={16} /> {cat.label}
        </Link>
        {userId && (
          <FavoritoButton
            meditacaoId={id}
            userId={userId}
            initialFavorito={isFavorito}
          />
        )}
      </div>

      {/* Categoria hero */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full shadow-lg shadow-black/30 ring-1 ring-white/10">
          <Image
            src={`/categorias/${cat.slug}.webp`}
            alt={cat.label}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
        <span
          className="mb-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: cat.cor + "25", color: cat.cor }}
        >
          {cat.label}
        </span>
        <h1 className="text-3xl font-semibold leading-tight text-[var(--text)]">
          {med.titulo}
        </h1>
      </div>

      {/* Sacred text */}
      {med.textoBiblico && (
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <blockquote className="sacred-text mb-2 text-[1.1rem]">
            &ldquo;{med.textoBiblico}&rdquo;
          </blockquote>
          {med.referencia && <p className="sacred-ref">{med.referencia}</p>}
        </div>
      )}

      {/* Audio Player */}
      {med.urlAudio && (
        <div className="mb-6">
          <AudioPlayer
            src={med.urlAudio}
            titulo={med.titulo}
            meditacaoId={id}
            userId={userId}
            duracaoSegundos={med.duracaoSegundos ?? undefined}
          />
        </div>
      )}

      {/* Transcricao */}
      {med.transcricao && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Reflexão
          </h2>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">{med.transcricao}</p>
        </section>
      )}
    </div>
  )
}
