"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export function TranscricaoExpandivel({ texto }: { texto: string }) {
  const [expanded, setExpanded] = useState(false)
  const [truncatable, setTruncatable] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    setTruncatable(el.scrollHeight > el.clientHeight + 1)
  }, [texto])

  return (
    <div>
      <motion.p
        ref={textRef}
        layout={!reduceMotion}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "text-sm leading-relaxed text-[var(--text-muted)]",
          !expanded && "line-clamp-4"
        )}
      >
        {texto}
      </motion.p>
      {truncatable && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs font-medium text-[var(--gold)] hover:text-[var(--gold-light)]"
        >
          {expanded ? "Mostrar menos" : "Mostrar mais"}
        </button>
      )}
    </div>
  )
}
