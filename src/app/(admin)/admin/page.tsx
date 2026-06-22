import { db } from "@/lib/db"
import { meditacoes, manadiario, users, favoritos } from "@/lib/db/schema"
import { sql } from "drizzle-orm"

export const metadata = { title: "Admin · Dashboard" }

export default async function AdminDashboard() {
  const [[{ count: totalMed }], [{ count: totalUsers }], [{ count: totalFav }], [{ count: totalMana }]] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(meditacoes),
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(favoritos),
      db.select({ count: sql<number>`count(*)` }).from(manadiario),
    ])

  const stats = [
    { label: "Meditações",   value: totalMed },
    { label: "Usuários",     value: totalUsers },
    { label: "Favoritos",    value: totalFav },
    { label: "Maná Diário",  value: totalMana },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--text)]">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <p className="font-display text-4xl font-light text-[var(--gold)]">{Number(value)}</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
