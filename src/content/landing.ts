export const SEO = {
  title: "Refúgio — Meditação Cristã para Ansiedade, Sono e Paz",
  description:
    "Meditações guiadas com base bíblica, o Maná Diário e sons relaxantes para cuidar da sua saúde emocional e espiritual. Grátis, direto no navegador.",
  ogImage: "/categorias/paz.webp",
}

export const HERO = {
  headline: "Um Refúgio diário para respirar, orar e descansar em Deus.",
  subheadline:
    "Meditações guiadas com base bíblica e um momento de paz com Deus, todos os dias, onde você estiver.",
  ctaLabel: "Criar conta",
  ctaSecondaryLabel: "Já tenho conta",
}

export const PROBLEMA = {
  headline: "Você não precisa enfrentar isso sozinho(a).",
  itens: [
    "A ansiedade aperta o peito sem avisar.",
    "As noites mal dormidas viram rotina.",
    "A oração vira só mais uma tarefa — ou desaparece de vez.",
    "A correria não deixa espaço pra respirar e ouvir a Deus.",
  ],
}

export const DIFERENCIAL = {
  headline: "Uma meditação com raiz bíblica.",
  paragrafo:
    "A maioria dos apps de meditação foca só em respiração e técnica. O Refúgio começa em outro lugar: na Palavra de Deus. Todos os dias, o Maná Diário traz um texto bíblico e uma reflexão para alimentar sua alma — o ponto de partida para cada meditação guiada, cada oração, cada momento de silêncio com Deus.",
}

export interface Funcionalidade {
  icone: "categorias" | "series" | "sons" | "conquistas"
  titulo: string
  descricao: string
}

export const FUNCIONALIDADES: Funcionalidade[] = [
  {
    icone: "categorias",
    titulo: "Temas pra cada momento",
    descricao:
      "De ansiedade a gratidão, de sono a esperança — encontre a meditação certa pro que você está sentindo agora.",
  },
  {
    icone: "series",
    titulo: "Séries pra ir mais fundo",
    descricao:
      "Sequências guiadas que caminham com você, dia após dia, num mesmo tema — sem pressa, no seu ritmo.",
  },
  {
    icone: "sons",
    titulo: "Sons pra acalmar a mente",
    descricao:
      "Chuva, ondas, sinos e músicas instrumentais pra criar seu próprio espaço de quietude, com ou sem meditação.",
  },
  {
    icone: "conquistas",
    titulo: "Conquistas pra celebrar sua jornada",
    descricao:
      "Cada dia de constância importa. Acompanhe sua sequência, suas meditações e desbloqueie conquistas no caminho.",
  },
]

export const INSTALACAO = {
  headline: "Leve o Refúgio com você",
  ios: {
    label: "iPhone (Safari)",
    passos: [
      "Abra refugio.muitomelhor.net no Safari.",
      "Toque no ícone de Compartilhar (o quadrado com a seta pra cima).",
      'Escolha "Adicionar à Tela de Início" e confirme.',
    ],
  },
  android: {
    label: "Android (Chrome)",
    passos: [
      "Abra refugio.muitomelhor.net no Chrome.",
      "Toque no menu (⋮) no canto superior direito.",
      'Escolha "Instalar app" ou "Adicionar à tela inicial".',
    ],
  },
}

export interface FaqItem {
  pergunta: string
  resposta: string
}

export const FAQ: { headline: string; itens: FaqItem[] } = {
  headline: "Perguntas frequentes",
  itens: [
    {
      pergunta: "O Refúgio é ligado a alguma igreja ou denominação específica?",
      resposta:
        "Não. O Refúgio é feito pra qualquer pessoa que segue a Jesus, independente da denominação ou tradição. Nosso foco é no que une a fé cristã: a Palavra de Deus, a oração e a busca por paz Nele.",
    },
    {
      pergunta: "Qual tradução da Bíblia vocês usam?",
      resposta:
        "Os textos do Maná Diário e das meditações são parafraseados — reescritos de forma acessível e contemplativa, sempre fiéis ao sentido original das Escrituras, em vez de citar uma tradução específica palavra por palavra.",
    },
    {
      pergunta: "O Refúgio é gratuito?",
      resposta:
        "Sim, hoje o Refúgio é 100% gratuito. Estamos no início e focados em servir bem quem já está aqui — se isso mudar no futuro, vamos avisar com antecedência e pensar em quem já faz parte da comunidade.",
    },
    {
      pergunta: "Meus dados estão seguros?",
      resposta:
        "Sim. Não vendemos seus dados nem os usamos pra anúncios. O login é só por código enviado ao seu e-mail (sem senha pra vazar), e suas meditações e seu progresso ficam privados, visíveis só pra você.",
    },
  ],
}

export const CTA_FINAL = {
  headline: "Seu Refúgio está a um toque de distância.",
  ctaLabel: "Criar conta",
}
