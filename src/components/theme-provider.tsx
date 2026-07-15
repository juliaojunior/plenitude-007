"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname()
  const forcedTheme = pathname === "/" ? "dark" : undefined

  return (
    <NextThemesProvider {...props} forcedTheme={forcedTheme}>
      {children}
    </NextThemesProvider>
  )
}
