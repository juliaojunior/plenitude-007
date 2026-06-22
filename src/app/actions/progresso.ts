"use server"

import { db } from "@/lib/db"
import { progressoUsuario, conquistasUsuario, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { CONQUISTAS } from "@/lib/conquistas"
import { nanoid } from "@/lib/nanoid"
import { todayString } from "@/lib/utils"
import { revalidatePath } from "next/cache"

export async function registrarMeditacaoConcluida(
  meditacaoId: string,
  userId: string,
  minutos: number
) {
  try {
    const hoje = todayString()

    // Garantir que o usuário existe
    const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!u) return

    const [prog] = await db
      .select()
      .from(progressoUsuario)
      .where(eq(progressoUsuario.userId, userId))
      .limit(1)

    if (!prog) {
      await db.insert(progressoUsuario).values({
        userId,
        diasConsecutivos: 1,
        totalMeditacoes: 1,
        totalMinutos: minutos,
        ultimaMeditacao: new Date(),
        ultimoAcesso: hoje,
      })
    } else {
      const ontem = new Date()
      ontem.setDate(ontem.getDate() - 1)
      const ontemStr = ontem.toISOString().split("T")[0]
      const diasConsec =
        prog.ultimoAcesso === hoje
          ? prog.diasConsecutivos ?? 1
          : prog.ultimoAcesso === ontemStr
            ? (prog.diasConsecutivos ?? 0) + 1
            : 1

      await db
        .update(progressoUsuario)
        .set({
          diasConsecutivos: diasConsec,
          totalMeditacoes: (prog.totalMeditacoes ?? 0) + 1,
          totalMinutos: (prog.totalMinutos ?? 0) + minutos,
          ultimaMeditacao: new Date(),
          ultimoAcesso: hoje,
        })
        .where(eq(progressoUsuario.userId, userId))
    }

    // Verificar conquistas
    const [updatedProg] = await db
      .select()
      .from(progressoUsuario)
      .where(eq(progressoUsuario.userId, userId))
      .limit(1)

    if (updatedProg) {
      const stats = {
        totalMeditacoes: updatedProg.totalMeditacoes ?? 0,
        diasConsecutivos: updatedProg.diasConsecutivos ?? 0,
        totalMinutos: updatedProg.totalMinutos ?? 0,
      }

      const conquistasExist = await db
        .select()
        .from(conquistasUsuario)
        .where(eq(conquistasUsuario.userId, userId))

      const conquistasIds = new Set(conquistasExist.map((c) => c.conquistaId))

      for (const conquista of CONQUISTAS) {
        if (!conquistasIds.has(conquista.id) && conquista.criterio(stats)) {
          await db.insert(conquistasUsuario).values({
            id: nanoid(),
            userId,
            conquistaId: conquista.id,
          })
        }
      }
    }

    revalidatePath("/perfil")
  } catch (e) {
    console.error(e)
  }
}

export async function atualizarNome(userId: string, nome: string) {
  await db.update(users).set({ name: nome.trim() }).where(eq(users.id, userId))
  revalidatePath("/perfil")
}
