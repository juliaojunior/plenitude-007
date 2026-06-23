import Link from "next/link"
import Image from "next/image"
import { CATEGORIAS } from "@/lib/categorias"

export const metadata = { title: "Meditações" }

export default function MeditacoesPage() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-1 text-2xl font-semibold text-[var(--text)]">Meditações</h1>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        Escolha uma categoria para começar
      </p>

      <div className="flex flex-col gap-3">
        {CATEGORIAS.map((cat) => (
          <Link
            key={cat.slug}
            href={`/meditacoes/${cat.slug}`}
            className="group flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-all hover:border-[var(--gold)]/40 hover:shadow-md active:scale-[0.99]"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full shadow-md shadow-black/30 ring-1 ring-white/10">
              <Image
                src={`/categorias/${cat.slug}.webp`}
                alt={cat.label}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--text)]">{cat.label}</p>
              <p className="text-xs text-[var(--text-muted)]">Explorar meditações</p>
            </div>
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: cat.cor }}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
