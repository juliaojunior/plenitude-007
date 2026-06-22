"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Heart, User } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/home", label: "Início",       icon: Home      },
  { href: "/meditacoes",  label: "Meditar",    icon: BookOpen  },
  { href: "/salvas",      label: "Salvas",     icon: Heart     },
  { href: "/perfil",      label: "Perfil",     icon: User      },
]

export function NavBottom() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg-card)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors",
                active
                  ? "text-[var(--gold)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              )}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 1.75}
                className={active ? "text-[var(--gold)]" : ""}
              />
              {label}
            </Link>
          )
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-safe-bottom" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
    </nav>
  )
}
