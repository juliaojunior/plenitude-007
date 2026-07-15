"use client"

import { useRef, useState, useTransition } from "react"
import type { ChangeEvent } from "react"
import Image from "next/image"
import { Pencil, Loader2 } from "lucide-react"
import { uploadAvatar, removerAvatar } from "@/app/actions/progresso"

interface Props { userId: string; initialUrl: string | null }

const MAX_DIM = 512
const MAX_ORIGINAL_BYTES = 5 * 1024 * 1024

async function compressToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas indisponível")
  ctx.drawImage(bitmap, 0, 0, w, h)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao processar imagem"))),
      "image/webp",
      0.85
    )
  })
}

export function AvatarEditor({ userId, initialUrl }: Props) {
  const [url, setUrl] = useState(initialUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const busy = loading || isPending

  async function onFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setError(null)
    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem.")
      return
    }
    if (file.size > MAX_ORIGINAL_BYTES) {
      setError("Imagem muito grande (máx. 5MB).")
      return
    }
    setLoading(true)
    let compressed: Blob
    try {
      compressed = await compressToWebp(file)
    } catch {
      setLoading(false)
      setError("Não foi possível processar a imagem.")
      return
    }
    const formData = new FormData()
    formData.append("file", compressed, "avatar.webp")
    startTransition(async () => {
      const result = await uploadAvatar(userId, formData)
      setLoading(false)
      if ("error" in result) setError(result.error)
      else setUrl(result.url)
    })
  }

  function remover() {
    setError(null)
    startTransition(async () => {
      await removerAvatar(userId)
      setUrl(null)
    })
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label="Alterar avatar"
          className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--gold)]/30 bg-[var(--bg-surface)]"
        >
          <Image src={url ?? "/avatar-padrao.webp"} alt="Avatar" fill sizes="80px" className="object-cover" />
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 size={20} className="animate-spin text-white" />
            </div>
          )}
        </button>
        <span className="pointer-events-none absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)]">
          <Pencil size={12} />
        </span>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />
      </div>
      {error && <p className="max-w-[12rem] text-center text-xs text-red-500">{error}</p>}
      {url && !busy && (
        <button type="button" onClick={remover} className="text-xs text-[var(--text-muted)] underline">
          Remover foto
        </button>
      )}
    </div>
  )
}
