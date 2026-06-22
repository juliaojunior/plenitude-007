"use client"

import { SignOutButton } from "@clerk/nextjs"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <SignOutButton redirectUrl="/sign-in">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--text)]"
      >
        <LogOut size={16} />
        Sair da conta
      </button>
    </SignOutButton>
  )
}
