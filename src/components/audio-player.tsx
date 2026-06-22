"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Play, Pause, RotateCcw } from "lucide-react"
import { registrarMeditacaoConcluida } from "@/app/actions/progresso"
import { formatDuration } from "@/lib/utils"

interface Props {
  src: string
  titulo: string
  meditacaoId: string
  userId: string | null
  duracaoSegundos?: number
}

export function AudioPlayer({ src, titulo, meditacaoId, userId, duracaoSegundos }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(duracaoSegundos ?? 0)
  const [concluida, setConcluida] = useState(false)

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play(); setPlaying(true) }
  }, [playing])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setCurrent(Math.floor(audio.currentTime))
    const onDur = () => setDuration(Math.floor(audio.duration))
    const onEnd = async () => {
      setPlaying(false)
      if (userId && !concluida) {
        setConcluida(true)
        await registrarMeditacaoConcluida(meditacaoId, userId, Math.floor(audio.duration / 60))
      }
    }
    audio.addEventListener("timeupdate", onTime)
    audio.addEventListener("loadedmetadata", onDur)
    audio.addEventListener("ended", onEnd)
    return () => {
      audio.removeEventListener("timeupdate", onTime)
      audio.removeEventListener("loadedmetadata", onDur)
      audio.removeEventListener("ended", onEnd)
    }
  }, [meditacaoId, userId, concluida])

  const progress = duration > 0 ? (current / duration) * 100 : 0

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <audio ref={audioRef} src={src} preload="metadata" />

      <p className="mb-4 text-xs font-medium text-[var(--text-muted)]">{titulo}</p>

      {/* Progress bar */}
      <div
        className="mb-4 h-1.5 w-full cursor-pointer rounded-full bg-[var(--bg-surface)]"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const pct = (e.clientX - rect.left) / rect.width
          if (audioRef.current) {
            audioRef.current.currentTime = pct * duration
          }
        }}
      >
        <div
          className="h-full rounded-full bg-[var(--gold)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-faint)]">{formatDuration(current)}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { if (audioRef.current) audioRef.current.currentTime = 0 }}
            className="text-[var(--text-muted)] hover:text-[var(--text)]"
            aria-label="Reiniciar"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={toggle}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold)] text-[#0D0F1C] shadow-lg hover:bg-[var(--gold-light)] active:scale-95 transition-transform"
            aria-label={playing ? "Pausar" : "Reproduzir"}
          >
            {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
        </div>
        <span className="text-xs text-[var(--text-faint)]">{formatDuration(duration)}</span>
      </div>
    </div>
  )
}
