"use client"

import { Children, cloneElement, isValidElement, useLayoutEffect, useRef } from "react"
import type { ReactElement, ReactNode } from "react"

const SPEED_PX_PER_SECOND = 24

/**
 * Horizontal auto-advancing carousel with a seamless infinite loop.
 *
 * `children` is rendered 3 times back to back (three equally "real" copies —
 * whichever one is in view at a given moment must stay clickable, since the
 * visible frame is never pinned to a single copy) so there's always
 * identical content ahead of and behind the visible frame. The scroll
 * position starts in the middle copy and wraps by exactly one copy's width
 * ("period") whenever it drifts into a neighboring copy — since that copy is
 * pixel-identical, the jump is invisible. This gives infinite-feeling drag in
 * both directions and an auto-advance with no visible reset, instead of
 * snapping back to 0 at the end of the list.
 *
 * Only the first copy is reachable by keyboard/screen reader (its items are
 * the real, primary ones); the other two are marked `aria-hidden` +
 * `tabIndex={-1}` per item so Tab and assistive tech encounter each
 * category/sound once, not 3 times. `inert` was tried instead and broke
 * mouse/touch clicks on those copies — `inert` disables hit-testing on the
 * whole subtree, not just keyboard/AT reachability, and since the viewport
 * starts over the *second* copy and drifts across all three as it scrolls,
 * that disabled clicks on whatever the user was currently looking at.
 * `aria-hidden`+`tabIndex={-1}` only affects focus order and the
 * accessibility tree, so pointer clicks keep working on every copy.
 *
 * Auto-advance moves by elapsed time (not a fixed per-frame pixel step) so
 * it isn't lost to the browser's scroll-position rounding, and is skipped
 * entirely under prefers-reduced-motion. It pauses while the user is
 * actively touching/dragging; manual scroll always works and wraps the same
 * way via the scroll listener.
 */
type FocusableProps = { "aria-hidden"?: boolean; tabIndex?: number }

// Duplicate copies are visual-only: hide each item from Tab order and
// assistive tech without touching pointer/click behavior (unlike `inert`,
// which would disable clicks too — see the component doc comment).
function forDuplicateCopy(children: ReactNode) {
  return Children.map(children, (child) =>
    isValidElement(child)
      ? cloneElement(child as ReactElement<FocusableProps>, { "aria-hidden": true, tabIndex: -1 })
      : child
  )
}

export function Carousel({ children }: { children: React.ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const firstSetRef = useRef<HTMLDivElement>(null)
  const secondSetRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    const firstSet = firstSetRef.current
    const secondSet = secondSetRef.current
    if (!scroller || !firstSet || !secondSet) return

    // Distance from the start of one copy to the start of the next,
    // including the gap between them — measured, not assumed, so it stays
    // correct regardless of item count or gap size.
    const period = secondSet.getBoundingClientRect().left - firstSet.getBoundingClientRect().left
    if (period <= 0) return

    // Start in the middle copy so dragging either direction has a full
    // duplicate's worth of room before a wrap is needed.
    scroller.scrollLeft = period
    let position = period

    const onScroll = () => {
      if (scroller.scrollLeft >= period * 2) scroller.scrollLeft -= period
      else if (scroller.scrollLeft <= 0) scroller.scrollLeft += period
    }
    scroller.addEventListener("scroll", onScroll, { passive: true })

    let raf: number | undefined
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      let lastTime = performance.now()
      const tick = (now: number) => {
        const dt = now - lastTime
        lastTime = now
        if (pausedRef.current) {
          // Resync after a manual drag so playback continues from there.
          position = scroller.scrollLeft
        } else {
          position += (SPEED_PX_PER_SECOND * dt) / 1000
          if (position >= period * 2) position -= period
          scroller.scrollLeft = position
        }
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    return () => {
      scroller.removeEventListener("scroll", onScroll)
      if (raf !== undefined) cancelAnimationFrame(raf)
    }
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
      <div ref={firstSetRef} className="flex shrink-0 gap-4">{children}</div>
      <div ref={secondSetRef} className="flex shrink-0 gap-4">{forDuplicateCopy(children)}</div>
      <div className="flex shrink-0 gap-4">{forDuplicateCopy(children)}</div>
    </div>
  )
}
