import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"
import { LandingPage } from "@/components/landing/landing-page"
import { SEO } from "@/content/landing"

export const metadata: Metadata = {
  title: SEO.title,
  description: SEO.description,
  openGraph: {
    title: SEO.title,
    description: SEO.description,
    images: [{ url: SEO.ogImage }],
  },
}

export default async function RootPage() {
  const { userId } = await auth()
  if (userId) redirect("/home")
  return <LandingPage />
}
