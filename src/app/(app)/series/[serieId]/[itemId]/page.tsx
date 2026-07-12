import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { series, meditacoes, favoritos } from "@/lib/db/schema"
import { FavoritoButton } from "@/components/favorito-button"
import { AudioPlayer } from "@/components/audio-player"

interface Props {
  params: Promise<{ serieId: string; itemId: string }>
}

export async function generateMetadata({ params }: Props) {
  const { itemId } = await params
  const [item] = await db.select().from(meditacoes).where(eq(meditacoes.id, itemId)).limit(1)
  return { title: item?.titulo ?? "Meditação" }
}

export default async function SerieItemPage({ params }: Props) {
  const { serieId, itemId } = await params
  const [serie] = await db.select().from(series).where(eq(series.id, serieId)).limit(1)
  if (!serie) notFound()

  const [item] = await db.select().from(meditacoes).where(eq(meditacoes.id, itemId)).limit(1)
  if (!item || item.serieId !== serieId) notFound()

  const { userId } = await auth()
  let isFavorito = false
  if (userId) {
    const [fav] = await db
      .select()
      .from(favoritos)
      .where(and(eq(favoritos.userId, userId), eq(favoritos.meditacaoId, itemId)))
      .limit(1)
    isFavorito = !!fav
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/series/${serieId}`}
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <ChevronLeft size={16} /> {serie.titulo}
        </Link>
        {userId && (
          <FavoritoButton meditacaoId={itemId} userId={userId} initialFavorito={isFavorito} />
        )}
      </div>

      <div className="mb-8 flex flex-col items-center text-center">
        <div
          className="mb-4 h-24 w-24 rounded-full shadow-lg shadow-black/30 ring-1 ring-white/10"
          style={{ backgroundColor: serie.cor ?? "var(--bg-surface)" }}
        />
        <span
          className="mb-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: (serie.cor ?? "#7B6FA0") + "25", color: serie.cor ?? "#7B6FA0" }}
        >
          {serie.titulo}
        </span>
        <h1 className="text-3xl font-semibold leading-tight text-[var(--text)]">
          {item.titulo}
        </h1>
      </div>

      {item.urlAudio && (
        <AudioPlayer
          src={item.urlAudio}
          titulo={item.titulo}
          meditacaoId={itemId}
          userId={userId}
          duracaoSegundos={item.duracaoSegundos ?? undefined}
        />
      )}
    </div>
  )
}
