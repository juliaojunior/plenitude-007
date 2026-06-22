export const CATEGORIAS = [
  { slug: "ansiedade",  label: "Ansiedade",  cor: "#4A7FA5", emoji: "🌊" },
  { slug: "agradecer",  label: "Gratidão",   cor: "#5A8A5F", emoji: "🌿" },
  { slug: "paz",        label: "Paz",         cor: "#7B6FA0", emoji: "☁️"  },
  { slug: "sabedoria",  label: "Sabedoria",  cor: "#9A7B2E", emoji: "🕯️" },
  { slug: "sono",       label: "Sono",        cor: "#3D5A80", emoji: "🌙" },
  { slug: "foco",       label: "Foco",        cor: "#8B5E3C", emoji: "🔥" },
  { slug: "perdao",     label: "Perdão",      cor: "#C4626A", emoji: "🕊️" },
  { slug: "esperanca",  label: "Esperança",  cor: "#E07B39", emoji: "🌅" },
  { slug: "cura",       label: "Cura",        cor: "#4A9E8E", emoji: "💧" },
] as const

export type CategoriaSlug = (typeof CATEGORIAS)[number]["slug"]

export function getCategoria(slug: string) {
  return CATEGORIAS.find((c) => c.slug === slug) ?? CATEGORIAS[0]
}
