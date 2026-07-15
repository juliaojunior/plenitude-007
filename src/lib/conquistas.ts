export type Tier = "bronze" | "prata" | "ouro"

// Conquistas de série são dinâmicas (uma por série, geradas a partir do
// título da série) em vez de entradas estáticas em CONQUISTAS — ver
// verificarConquistaDeSerie em src/app/actions/progresso.ts.
export const SERIE_CONQUISTA_PREFIX = "serie-completa-"

export interface Conquista {
  id: string
  titulo: string
  descricao: string
  emoji: string
  tier: Tier
  criterio: (stats: { totalMeditacoes: number; diasConsecutivos: number; totalMinutos: number }) => boolean
}

export const CONQUISTAS: Conquista[] = [
  {
    id: "primeiro-passo",
    titulo: "Primeiro Passo",
    descricao: "Complete sua primeira meditação",
    emoji: "🌱",
    tier: "bronze",
    criterio: ({ totalMeditacoes }) => totalMeditacoes >= 1,
  },
  {
    id: "semana-zen",
    titulo: "Semana Abençoada",
    descricao: "7 dias consecutivos meditando",
    emoji: "🌿",
    tier: "bronze",
    criterio: ({ diasConsecutivos }) => diasConsecutivos >= 7,
  },
  {
    id: "dez-meditacoes",
    titulo: "Dez Momentos",
    descricao: "Complete 10 meditações",
    emoji: "✨",
    tier: "bronze",
    criterio: ({ totalMeditacoes }) => totalMeditacoes >= 10,
  },
  {
    id: "hora-de-paz",
    titulo: "Hora de Paz",
    descricao: "Acumule 60 minutos meditando",
    emoji: "⏳",
    tier: "prata",
    criterio: ({ totalMinutos }) => totalMinutos >= 60,
  },
  {
    id: "trinta-dias",
    titulo: "Mês de Plenitude",
    descricao: "30 dias consecutivos",
    emoji: "📅",
    tier: "prata",
    criterio: ({ diasConsecutivos }) => diasConsecutivos >= 30,
  },
  {
    id: "cinquenta-meditacoes",
    titulo: "Meio Centenário",
    descricao: "Complete 50 meditações",
    emoji: "🌙",
    tier: "prata",
    criterio: ({ totalMeditacoes }) => totalMeditacoes >= 50,
  },
  {
    id: "seculo-de-paz",
    titulo: "Século de Paz",
    descricao: "Complete 100 meditações",
    emoji: "🏆",
    tier: "ouro",
    criterio: ({ totalMeditacoes }) => totalMeditacoes >= 100,
  },
  {
    id: "cien-dias",
    titulo: "Cem Dias Sagrados",
    descricao: "100 dias consecutivos",
    emoji: "👑",
    tier: "ouro",
    criterio: ({ diasConsecutivos }) => diasConsecutivos >= 100,
  },
  {
    id: "mil-minutos",
    titulo: "Mil Minutos",
    descricao: "Acumule 1000 minutos meditando",
    emoji: "🌟",
    tier: "ouro",
    criterio: ({ totalMinutos }) => totalMinutos >= 1000,
  },
  {
    id: "trezentas-meditacoes",
    titulo: "Guardião da Paz",
    descricao: "Complete 300 meditações",
    emoji: "⚜️",
    tier: "ouro",
    criterio: ({ totalMeditacoes }) => totalMeditacoes >= 300,
  },
]

export const TIER_COLORS: Record<Tier, { bg: string; text: string; border: string }> = {
  bronze: { bg: "bg-amber-900/30", text: "text-amber-500", border: "border-amber-700/50" },
  prata: { bg: "bg-slate-700/30", text: "text-slate-300", border: "border-slate-500/50" },
  ouro: { bg: "bg-yellow-900/30", text: "text-yellow-400", border: "border-yellow-600/50" },
}
