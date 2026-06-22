import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { LayoutDashboard, BookOpen, Sun } from "lucide-react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user?.isAdmin) redirect("/home")

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--bg-card)] p-4">
        <p className="mb-6 px-2 text-sm font-semibold uppercase tracking-widest text-[var(--gold)]">
          Admin
        </p>
        <nav className="flex flex-col gap-1">
          {[
            { href: "/admin",               label: "Dashboard",   icon: LayoutDashboard },
            { href: "/admin/meditacoes",     label: "Meditações",  icon: BookOpen },
            { href: "/admin/mana-diario",    label: "Maná Diário", icon: Sun },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text)] transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-[var(--border)] pt-4">
          <Link
            href="/home"
            className="text-xs text-[var(--text-faint)] hover:text-[var(--text-muted)]"
          >
            ← Voltar ao app
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
