"use server"

import { put } from "@vercel/blob"
import { db } from "@/lib/db"
import { progressoUsuario, conquistasUsuario, users, meditacoesConcluidas, meditacoes } from "@/lib/db/schema"
import { eq, and, count } from "drizzle-orm"
import { CONQUISTAS, SERIE_CONQUISTA_PREFIX } from "@/lib/conquistas"
import { nanoid } from "@/lib/nanoid"
import { todayString } from "@/lib/utils"
import { revalidatePath } from "next/cache"

const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"]
const AVATAR_MAX_BYTES = 5 * 1024 * 1024

async function verificarConquistaDeSerie(userId: string, meditacaoId: string) {
  const [med] = await db
    .select({ serieId: meditacoes.serieId })
    .from(meditacoes)
    .where(eq(meditacoes.id, meditacaoId))
    .limit(1)
  if (!med?.serieId) return
  const serieId = med.serieId

  const [{ total }] = await db
    .select({ total: count() })
    .from(meditacoes)
    .where(eq(meditacoes.serieId, serieId))

  const [{ feitas }] = await db
    .select({ feitas: count() })
    .from(meditacoesConcluidas)
    .innerJoin(meditacoes, eq(meditacoesConcluidas.meditacaoId, meditacoes.id))
    .where(and(eq(meditacoesConcluidas.userId, userId), eq(meditacoes.serieId, serieId)))

  if (total === 0 || feitas < total) return

  const conquistaId = `${SERIE_CONQUISTA_PREFIX}${serieId}`
  const [ja] = await db
    .select()
    .from(conquistasUsuario)
    .where(and(eq(conquistasUsuario.userId, userId), eq(conquistasUsuario.conquistaId, conquistaId)))
    .limit(1)
  if (!ja) {
    await db.insert(conquistasUsuario).values({ id: nanoid(), userId, conquistaId })
  }
}

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

    // Registro individual (idempotente): guarda a 1ª conclusão dessa meditação por esse usuário.
    await db.insert(meditacoesConcluidas)
      .values({ id: nanoid(), userId, meditacaoId })
      .onConflictDoNothing()

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

    await verificarConquistaDeSerie(userId, meditacaoId)

    revalidatePath("/perfil")
  } catch (e) {
    console.error(e)
  }
}

export async function atualizarNome(userId: string, nome: string) {
  await db.update(users).set({ name: nome.trim() }).where(eq(users.id, userId))
  revalidatePath("/perfil")
}

export async function uploadAvatar(
  userId: string,
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  const file = formData.get("file")
  if (!(file instanceof File)) return { error: "Nenhum arquivo enviado." }
  if (!AVATAR_TYPES.includes(file.type)) {
    return { error: "Formato não suportado. Envie uma imagem JPG, PNG ou WEBP." }
  }
  if (file.size > AVATAR_MAX_BYTES) return { error: "Arquivo muito grande (máx. 5MB)." }

  const blob = await put(`avatares/${userId}-${Date.now()}.webp`, file, {
    access: "public",
    contentType: "image/webp",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
  await db.update(users).set({ avatarUrl: blob.url }).where(eq(users.id, userId))
  revalidatePath("/perfil")
  return { url: blob.url }
}

export async function removerAvatar(userId: string) {
  await db.update(users).set({ avatarUrl: null }).where(eq(users.id, userId))
  revalidatePath("/perfil")
}
