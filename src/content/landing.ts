export const SEO = {
  title: "[PREENCHER: título de SEO, ~60 caracteres]",
  description: "[PREENCHER: meta description, ~150-160 caracteres]",
  ogImage: "/categorias/paz.webp",
}

export const HERO = {
  headline: "[PREENCHER: headline principal do hero]",
  subheadline: "[PREENCHER: subheadline de apoio, 1-2 frases]",
  ctaLabel: "Criar conta",
  ctaSecondaryLabel: "Já tenho conta",
}

export const PROBLEMA = {
  headline: "[PREENCHER: headline da seção de dor/validação]",
  itens: [
    "[PREENCHER: dor 1 — ex: ansiedade]",
    "[PREENCHER: dor 2 — ex: insônia]",
    "[PREENCHER: dor 3 — ex: distância espiritual]",
    "[PREENCHER: dor 4]",
  ],
}

export const DIFERENCIAL = {
  headline: "[PREENCHER: headline do diferencial]",
  paragrafo:
    "[PREENCHER: parágrafo explicando a base bíblica e o Maná Diário como diferencial frente a apps seculares]",
}

export interface Funcionalidade {
  icone: "categorias" | "series" | "sons" | "conquistas"
  titulo: string
  descricao: string
}

export const FUNCIONALIDADES: Funcionalidade[] = [
  {
    icone: "categorias",
    titulo: "[PREENCHER: título — categorias]",
    descricao: "[PREENCHER: descrição curta — 9 categorias de meditação]",
  },
  {
    icone: "series",
    titulo: "[PREENCHER: título — séries]",
    descricao: "[PREENCHER: descrição curta — progressão em séries]",
  },
  {
    icone: "sons",
    titulo: "[PREENCHER: título — sons]",
    descricao: "[PREENCHER: descrição curta — sons e músicas ambiente]",
  },
  {
    icone: "conquistas",
    titulo: "[PREENCHER: título — conquistas]",
    descricao: "[PREENCHER: descrição curta — sistema de conquistas]",
  },
]

export const INSTALACAO = {
  headline: "[PREENCHER: headline da seção de instalação]",
  ios: {
    label: "iPhone (Safari)",
    passos: [
      "[PREENCHER: passo 1 iOS — ex: abra o site no Safari]",
      "[PREENCHER: passo 2 iOS — ex: toque em Compartilhar]",
      "[PREENCHER: passo 3 iOS — ex: toque em Adicionar à Tela de Início]",
    ],
  },
  android: {
    label: "Android (Chrome)",
    passos: [
      "[PREENCHER: passo 1 Android — ex: abra o site no Chrome]",
      "[PREENCHER: passo 2 Android — ex: toque no menu (⋮)]",
      "[PREENCHER: passo 3 Android — ex: toque em Instalar app]",
    ],
  },
}

export interface FaqItem {
  pergunta: string
  resposta: string
}

export const FAQ: { headline: string; itens: FaqItem[] } = {
  headline: "[PREENCHER: headline do FAQ — ex: Perguntas frequentes]",
  itens: [
    { pergunta: "[PERGUNTA 1 — denominação]", resposta: "[RESPOSTA 1]" },
    { pergunta: "[PERGUNTA 2 — tradução bíblica usada]", resposta: "[RESPOSTA 2]" },
    { pergunta: "[PERGUNTA 3 — gratuidade]", resposta: "[RESPOSTA 3]" },
    { pergunta: "[PERGUNTA 4 — privacidade]", resposta: "[RESPOSTA 4]" },
  ],
}

export const CTA_FINAL = {
  headline: "[PREENCHER: headline do CTA final]",
  ctaLabel: "Criar conta",
}
