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

    const SPEED_PX_PER_FRAME = 0.4
    let raf: number

    const tick = () => {
      if (!pausedRef.current) {
        const atEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1
        scroller.scrollLeft = atEnd ? 0 : scroller.scrollLeft + SPEED_PX_PER_FRAME
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
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </div>
  )
}
