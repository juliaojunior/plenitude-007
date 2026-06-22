"use server"

import { db } from "@/lib/db"
import { notificacoesConfig } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

interface Config {
  ativo: boolean
  horarios: string[]
  diasSemana: number[]
  tipos: string[]
  antecedenciaMinutos: number
}

export async function salvarNotificacoes(userId: string, config: Config) {
  try {
    await db
      .insert(notificacoesConfig)
      .values({ userId, ...config, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: notificacoesConfig.userId,
        set: { ...config, updatedAt: new Date() },
      })
    return { ok: true }
  } catch (e) {
    console.error(e)
    return { ok: false }
  }
}
