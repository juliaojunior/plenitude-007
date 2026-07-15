import { db } from "@/lib/db"
import { series, meditacoes, meditacoesConcluidas } from "@/lib/db/schema"
import { eq, and, count, isNotNull } from "drizzle-orm"

export async function getSeries(userId: string) {
  try {
    const seriesList = await db.select().from(series).where(eq(series.ativa, true))
    if (seriesList.length === 0) return []

    const totais = await db
      .select({ serieId: meditacoes.serieId, total: count() })
      .from(meditacoes)
      .where(isNotNull(meditacoes.serieId))
      .groupBy(meditacoes.serieId)

    const feitas = await db
      .select({ serieId: meditacoes.serieId, feitas: count() })
      .from(meditacoesConcluidas)
      .innerJoin(meditacoes, eq(meditacoesConcluidas.meditacaoId, meditacoes.id))
      .where(and(eq(meditacoesConcluidas.userId, userId), isNotNull(meditacoes.serieId)))
      .groupBy(meditacoes.serieId)

    const totalMap = new Map(totais.map((t) => [t.serieId, t.total]))
    const feitasMap = new Map(feitas.map((f) => [f.serieId, f.feitas]))

    return seriesList.map((s) => ({
      ...s,
      total: totalMap.get(s.id) ?? 0,
      concluidas: feitasMap.get(s.id) ?? 0,
    }))
  } catch {
    return []
  }
}
