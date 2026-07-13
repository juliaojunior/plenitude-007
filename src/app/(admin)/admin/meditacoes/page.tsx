import { isNull } from "drizzle-orm"
import { db } from "@/lib/db"
import { meditacoes } from "@/lib/db/schema"
import { MeditacoesAdmin } from "@/components/admin/meditacoes-admin"

export const metadata = { title: "Admin · Meditações" }

export default async function AdminMeditacoesPage() {
  // Só meditações por categoria — itens de série não têm CRUD de admin (ver spec de séries).
  const rows = await db
    .select()
    .from(meditacoes)
    .where(isNull(meditacoes.serieId))
    .orderBy(meditacoes.categoria, meditacoes.titulo)
  const lista = rows.map((m) => ({ ...m, categoria: m.categoria! }))
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--text)]">Meditações</h1>
      <MeditacoesAdmin initialData={lista} />
    </div>
  )
}
