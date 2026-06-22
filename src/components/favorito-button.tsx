"use client"

import { useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleFavorito } from "@/app/actions/favoritos"

interface Props {
  meditacaoId: string
  userId: string
  initialFavorito: boolean
}

export function FavoritoButton({ meditacaoId, userId, initialFavorito }: Props) {
  const [isFav, setIsFav] = useState(initialFavorito)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFavorito(meditacaoId, userId)
      if (result.ok) setIsFav(result.isFavorito)
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFav ? "Remover dos favoritos" : "Salvar meditação"}
    >
      <Heart
        size={20}
        className={isFav ? "fill-[var(--gold)] text-[var(--gold)]" : "text-[var(--text-muted)]"}
      />
    </Button>
  )
}
