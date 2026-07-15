"use client"

import { useState, useTransition } from "react"
import { Pencil, Check, X } from "lucide-react"
import { atualizarNome } from "@/app/actions/progresso"

interface Props { initialNome: string; userId: string; isPlaceholder?: boolean }

export function NomeEditor({ initialNome, userId, isPlaceholder = false }: Props) {
  const [editing, setEditing] = useState(false)
  const [nome, setNome] = useState(initialNome)
  const [draft, setDraft] = useState("")
  const [placeholder, setPlaceholder] = useState(isPlaceholder)
  const [isPending, startTransition] = useTransition()

  function save() {
    if (!draft.trim()) return
    startTransition(async () => {
      await atualizarNome(userId, draft.trim())
      setNome(draft.trim())
      setPlaceholder(false)
      setEditing(false)
    })
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false) }}
          className="rounded-lg border border-[var(--gold)] bg-[var(--bg-surface)] px-3 py-1 text-center text-lg font-semibold text-[var(--text)] focus:outline-none"
          maxLength={40}
        />
        <button onClick={save} disabled={isPending} className="text-[var(--gold)]" aria-label="Salvar">
          <Check size={18} />
        </button>
        <button onClick={() => setEditing(false)} className="text-[var(--text-muted)]" aria-label="Cancelar">
          <X size={18} />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => { setDraft(placeholder ? "" : nome); setEditing(true) }}
      className={`group flex items-center gap-2 text-xl font-semibold ${placeholder ? "italic text-[var(--text-muted)]" : "text-[var(--text)]"}`}
    >
      {nome}
      <Pencil size={14} className="text-[var(--text-faint)] opacity-40 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}
