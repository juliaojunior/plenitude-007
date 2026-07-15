"use client"

import { SignOutButton } from "@clerk/nextjs"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <SignOutButton redirectUrl="/sign-in">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 py-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
      >
        <LogOut size={16} />
        Sair da conta
      </button>
    </SignOutButton>
  )
}
