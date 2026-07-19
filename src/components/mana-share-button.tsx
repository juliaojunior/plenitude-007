"use client"

import { useState } from "react"
import { Share2, Loader2 } from "lucide-react"

interface Props {
  data: string
  referencia: string
}

export function ManaShareButton({ data, referencia }: Props) {
  const [loading, setLoading] = useState(false)

  const share = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/mana-card?data=${data}`)
      if (!res.ok) return
      const blob = await res.blob()
      const file = new File([blob], `mana-${data}.png`, { type: "image/png" })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Maná Diário — Refúgio",
          text: referencia,
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `mana-${data}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      // navigator.share rejeita com AbortError quando o usuário cancela a folha nativa — comportamento esperado, sem feedback de erro necessário
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={share}
      disabled={loading}
      aria-label="Compartilhar Maná Diário"
      className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:text-[var(--gold)] disabled:opacity-50"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
    </button>
  )
}
