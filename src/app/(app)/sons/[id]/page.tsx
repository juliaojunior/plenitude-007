import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft } from "lucide-react"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { sons } from "@/lib/db/schema"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const [som] = await db.select().from(sons).where(eq(sons.id, id)).limit(1)
  return { title: som?.titulo ?? "Som" }
}

export default async function SomPage({ params }: Props) {
  const { id } = await params
  const [som] = await db.select().from(sons).where(eq(sons.id, id)).limit(1)
  if (!som) notFound()

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <div className="mb-6">
        <Link
          href="/home"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <ChevronLeft size={16} /> Início
        </Link>
      </div>

      <div className="mb-8 flex flex-col items-center text-center">
        <div
          className="relative mb-4 h-24 w-24 overflow-hidden rounded-full shadow-lg shadow-black/30 ring-1 ring-white/10"
          style={{ backgroundColor: som.cor ?? "var(--bg-surface)" }}
        >
          {som.imagem && (
            <Image src={som.imagem} alt={som.titulo} fill sizes="96px" className="object-cover" />
          )}
        </div>
        <h1 className="text-3xl font-semibold leading-tight text-[var(--text)]">{som.titulo}</h1>
        {som.descricao && (
          <p className="mt-2 text-sm text-[var(--text-muted)]">{som.descricao}</p>
        )}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <audio controls loop src={som.urlAudio} className="w-full" />
      </div>
    </div>
  )
}
