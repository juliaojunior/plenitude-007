import { headers } from "next/headers"
import { Webhook } from "svix"
import { db } from "@/lib/db"
import { users, progressoUsuario } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

type ClerkUserEvent = {
  type: "user.created" | "user.updated" | "user.deleted"
  data: {
    id: string
    email_addresses: { email_address: string; id: string }[]
    primary_email_address_id: string
    first_name: string | null
    last_name: string | null
    deleted?: boolean
  }
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) return new Response("Webhook secret not configured", { status: 500 })

  const headersList = await headers()
  const svixId = headersList.get("svix-id")
  const svixTimestamp = headersList.get("svix-timestamp")
  const svixSignature = headersList.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  const body = await req.text()
  const wh = new Webhook(secret)

  let event: ClerkUserEvent
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent
  } catch {
    return new Response("Invalid webhook signature", { status: 400 })
  }

  const { type, data } = event

  if (type === "user.created") {
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    )
    await db.insert(users).values({
      id: data.id,
      email: primaryEmail?.email_address ?? "",
      name: data.first_name ?? null,
    }).onConflictDoNothing()

    await db.insert(progressoUsuario).values({
      userId: data.id,
    }).onConflictDoNothing()
  }

  if (type === "user.updated") {
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    )
    await db.update(users)
      .set({
        email: primaryEmail?.email_address ?? "",
        name: data.first_name ?? null,
      })
      .where(eq(users.id, data.id))
  }

  if (type === "user.deleted") {
    await db.delete(users).where(eq(users.id, data.id))
  }

  return new Response("OK", { status: 200 })
}
