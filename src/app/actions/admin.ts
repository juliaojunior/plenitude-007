"use server"

import { db } from "@/lib/db"
import { meditacoes, manadiario } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "@/lib/nanoid"
import { revalidatePath } from "next/cache"

// ── Meditações ────────────────────────────────────────────

export async function criarMeditacao(data: {
  titulo: string
  categoria: string
  urlAudio?: string
  textoBiblico?: string
  referencia?: string
  transcricao?: string
  duracaoSegundos?: number
}) {
  const id = nanoid()
  await db.insert(meditacoes).values({ id, ...data })
  revalidatePath("/admin/meditacoes")
  revalidatePath(`/meditacoes/${data.categoria}`)
  return { id }
}

export async function atualizarMeditacao(
  id: string,
  data: Partial<typeof meditacoes.$inferInsert>
) {
  await db.update(meditacoes).set({ ...data, updatedAt: new Date() }).where(eq(meditacoes.id, id))
  revalidatePath("/admin/meditacoes")
  if (data.categoria) revalidatePath(`/meditacoes/${data.categoria}`)
}

export async function deletarMeditacao(id: string) {
  await db.delete(meditacoes).where(eq(meditacoes.id, id))
  revalidatePath("/admin/meditacoes")
  revalidatePath("/meditacoes")
}

// ── Maná Diário ───────────────────────────────────────────

export async function criarMana(data: {
  data: string
  textoBiblico: string
  referencia?: string
  comentario?: string
}) {
  const id = nanoid()
  await db.insert(manadiario).values({ id, ...data })
  revalidatePath("/admin/mana-diario")
  revalidatePath("/home")
}

export async function atualizarMana(
  id: string,
  data: Partial<typeof manadiario.$inferInsert>
) {
  await db.update(manadiario).set({ ...data, updatedAt: new Date() }).where(eq(manadiario.id, id))
  revalidatePath("/admin/mana-diario")
  revalidatePath("/home")
}

export async function deletarMana(id: string) {
  await db.delete(manadiario).where(eq(manadiario.id, id))
  revalidatePath("/admin/mana-diario")
}
