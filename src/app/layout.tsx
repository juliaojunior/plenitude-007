import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import { AnimatedBackground } from "@/components/animated-background"
import "./globals.css"

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
})

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: { default: "Refúgio", template: "%s · Refúgio" },
  description: "Meditações cristãs para o seu bem-estar espiritual diário.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Refúgio" },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F0" },
    { media: "(prefers-color-scheme: dark)",  color: "#0D0F1C" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${cormorant.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <AnimatedBackground />
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
