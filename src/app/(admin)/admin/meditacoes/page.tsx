import { db } from "@/lib/db"
import { meditacoes } from "@/lib/db/schema"
import { MeditacoesAdmin } from "@/components/admin/meditacoes-admin"

export const metadata = { title: "Admin · Meditações" }

export default async function AdminMeditacoesPage() {
  const lista = await db.select().from(meditacoes).orderBy(meditacoes.categoria, meditacoes.titulo)
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--text)]">Meditações</h1>
      <MeditacoesAdmin initialData={lista} />
    </div>
  )
}
