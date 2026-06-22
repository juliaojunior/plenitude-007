"use server"

import { db } from "@/lib/db"
import { favoritos } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { nanoid } from "@/lib/nanoid"

export async function toggleFavorito(meditacaoId: string, userId: string) {
  try {
    const [existing] = await db
      .select()
      .from(favoritos)
      .where(and(eq(favoritos.userId, userId), eq(favoritos.meditacaoId, meditacaoId)))
      .limit(1)

    if (existing) {
      await db.delete(favoritos).where(eq(favoritos.id, existing.id))
      return { ok: true, isFavorito: false }
    } else {
      await db.insert(favoritos).values({ id: nanoid(), userId, meditacaoId })
      return { ok: true, isFavorito: true }
    }
  } catch (e) {
    console.error(e)
    return { ok: false, isFavorito: false }
  }
}
