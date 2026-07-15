"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { HERO } from "@/content/landing"

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const word = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}

export function Hero() {
  const reduceMotion = useReducedMotion()
  const words = HERO.headline.split(" ")

  return (
    <section className="flex min-h-[90vh] flex-col items-center justify-center gap-6 px-6 text-center">
      {reduceMotion ? (
        <h1 className="font-display max-w-3xl text-4xl font-light text-[var(--text)] sm:text-5xl">
          {HERO.headline}
        </h1>
      ) : (
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={container}
          className="font-display max-w-3xl text-4xl font-light text-[var(--text)] sm:text-5xl"
        >
          {words.map((w, i) => (
            <motion.span key={i} variants={word} className="mr-[0.25em] inline-block">
              {w}
            </motion.span>
          ))}
        </motion.h1>
      )}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.6 }}
        className="max-w-xl text-base text-[var(--text-muted)] sm:text-lg"
      >
        {HERO.subheadline}
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.9 }}
        className="flex flex-col items-center gap-3 sm:flex-row"
      >
        <Button asChild size="lg">
          <Link href="/sign-up">{HERO.ctaLabel}</Link>
        </Button>
        <Link
          href="/sign-in"
          className="text-sm text-[var(--text-muted)] underline-offset-4 hover:text-[var(--text)] hover:underline"
        >
          {HERO.ctaSecondaryLabel}
        </Link>
      </motion.div>
    </section>
  )
}
