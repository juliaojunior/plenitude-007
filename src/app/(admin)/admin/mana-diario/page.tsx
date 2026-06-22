import { db } from "@/lib/db"
import { manadiario } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { ManaAdmin } from "@/components/admin/mana-admin"

export const metadata = { title: "Admin · Maná Diário" }

export default async function AdminManaDiarioPage() {
  const lista = await db.select().from(manadiario).orderBy(desc(manadiario.data))
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--text)]">Maná Diário</h1>
      <ManaAdmin initialData={lista} />
    </div>
  )
}
