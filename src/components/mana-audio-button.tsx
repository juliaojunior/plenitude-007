"use client"

import { useRef, useState } from "react"
import { Headphones, Pause } from "lucide-react"

interface Props {
  src: string
  titulo: string
}

export function ManaAudioButton({ src, titulo }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
      setPlaying(true)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={playing ? `Pausar narração: ${titulo}` : `Ouvir narração: ${titulo}`}
      className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:text-[var(--gold)]"
    >
      <audio ref={audioRef} src={src} preload="none" onEnded={() => setPlaying(false)} />
      {playing ? <Pause size={14} /> : <Headphones size={14} />}
    </button>
  )
}
