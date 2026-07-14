"use client"

import { useEffect, useRef } from "react"

/**
 * Horizontal auto-advancing carousel. Native scroll handles drag/touch;
 * a rAF loop nudges scrollLeft forward and loops back at the end.
 * Auto-advance is skipped entirely under prefers-reduced-motion, and
 * paused while the user is actively touching/dragging.
 */
export function Carousel({ children }: { children: React.ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const SPEED_PX_PER_SECOND = 24
    // Tracked separately from scroller.scrollLeft: browsers quantize the
    // scroll position, so re-reading it each frame and adding a sub-pixel
    // delta (24px/s ÷ 60fps ≈ 0.4px) silently loses the increment to
    // rounding and the carousel never visibly moves.
    let position = scroller.scrollLeft
    let lastTime = performance.now()
    let raf: number

    const tick = (now: number) => {
      const dt = now - lastTime
      lastTime = now
      if (pausedRef.current) {
        // Resync after a manual drag so playback continues from there.
        position = scroller.scrollLeft
      } else {
        const maxScroll = scroller.scrollWidth - scroller.clientWidth
        position += (SPEED_PX_PER_SECOND * dt) / 1000
        if (position >= maxScroll) position = 0
        scroller.scrollLeft = position
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const pause = () => { pausedRef.current = true }
  const resume = () => { pausedRef.current = false }

  return (
    <div
      ref={scrollerRef}
      onPointerDown={pause}
      onPointerUp={resume}
      onPointerLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </div>
  )
}
