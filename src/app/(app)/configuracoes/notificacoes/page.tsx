import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { notificacoesConfig } from "@/lib/db/schema"
import { NotificacoesForm } from "@/components/notificacoes-form"

export const metadata = { title: "Notificações" }

export default async function NotificacoesPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [config] = await db
    .select()
    .from(notificacoesConfig)
    .where(eq(notificacoesConfig.userId, userId))
    .limit(1)

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <Link
        href="/perfil"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
      >
        <ChevronLeft size={16} /> Perfil
      </Link>

      <h1 className="mb-1 text-2xl font-semibold text-[var(--text)]">Notificações</h1>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        Configure lembretes para sua prática diária
      </p>

      <NotificacoesForm userId={userId} config={config ?? null} />
    </div>
  )
}
