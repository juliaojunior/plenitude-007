# Compartilhamento do Maná Diário via WhatsApp

## Contexto

O Maná Diário (home) não tem nenhum jeito de compartilhar. Quero um botão que gere um cartão de imagem bonito e profissional (fundo com a identidade visual do Refúgio) com o texto do dia, e abra a folha nativa de compartilhamento do celular — WhatsApp é o destino principal, mas a folha nativa também mostra outros apps.

Escopo: só o Maná Diário (home) por enquanto. Meditações e Sons ficam de fora.

## Assets fornecidos

Dois PNGs em `public/`, 506×912px (retrato, formato tipo story):
- `cardRefugio_01.png` — mockup de referência, com texto de exemplo já desenhado ("BOM DIA, CORAÇÃO!", Salmo 91:2, versículo, reflexão curta). Só para referência visual, não usado em runtime.
- `cardRefugio_02.png` — versão em branco da mesma arte (moldura, título "REFÚGIO", pomba+mãos, caixa de pergaminho vazia, rodapé "Devocional Diário"). **Este é o template usado para gerar o card real.**

## Arquitetura

Geração de imagem 100% no servidor (Vercel/Next), sob demanda, reutilizável para qualquer dia — nenhuma etapa manual.

**`src/app/api/mana-card/route.tsx`** (runtime Node, não Edge — precisa de `fs` para ler o template e as fontes locais):
- Recebe `?data=YYYY-MM-DD` via query string.
- Busca o Maná daquele dia no banco (`manadiario`, mesmo padrão de `getManaHoje()` em `home/page.tsx`). 404 se não existir.
- Usa `ImageResponse` de `next/og` (já embutido no Next.js, zero dependência nova) para compor:
  - Fundo: `cardRefugio_02.png`, lido via `fs.readFileSync` do diretório `public/` e embutido como data URI base64 (evita fetch de rede).
  - Fonte: Cormorant Garamond (regular, bold, itálico) — mesma fonte já usada no app para o texto bíblico (`--font-cormorant` em `globals.css`, classe `.sacred-text`). `next/og` exige os bytes da fonte diretamente (não integra com `next/font`), então os arquivos `.ttf` das 3 variantes necessárias são baixados do Google Fonts e commitados em `src/assets/fonts/cormorant-garamond/`.
  - Camada de texto sobreposta via flexbox (Satori/`ImageResponse` só suporta flexbox, não CSS livre):
    - Saudação (dourado `#D4AA5F`, bold), posicionada entre a arte da pomba/mãos e a caixa de pergaminho. Varia por horário do servidor no momento da geração: "BOM DIA", "BOA TARDE", "BOA NOITE" + ", CORAÇÃO!" — mesma lógica de `hora < 12 / < 18 / resto` já usada em `home/page.tsx`.
    - Dentro da caixa de pergaminho: referência (bold, tom terroso escuro `#5C3D1F` ou próximo), versículo (itálico, mesma cor), e uma **linha curta de reflexão** (regular, menor).
  - Cache: header `Cache-Control: public, max-age=3600` na resposta — evita regenerar a mesma imagem em toques repetidos no mesmo dia.

**Reflexão curta (não o `comentario` inteiro):** o campo `comentario` tem 100–300 palavras, não cabe na caixa de tamanho fixo do template. O card usa só a **primeira frase** do `comentario`, cortada com reticências se passar de ~140 caracteres. Reaproveita o mesmo regex de split por frase já usado em `scripts/generate-mana-audio.ts` (`/(?<=[.!?…])\s+/`).

## Componente de compartilhamento

**`src/components/mana-share-button.tsx`** (client component), mesmo estilo visual do `ManaAudioButton` já existente (botão redondo, ícone 14px, `text-[var(--text-muted)]` → hover `text-[var(--gold)]`). Ícone `Share2` (lucide-react, já instalado).

Ao clicar:
1. `fetch('/api/mana-card?data=' + data)`, converte a resposta em `File` (`image/png`).
2. Se `navigator.canShare?.({ files: [file] })` for verdadeiro: `navigator.share({ files: [file], title: 'Maná Diário — Refúgio', text: referencia })` — abre a folha nativa do sistema (WhatsApp aparece como uma das opções).
3. Fallback (desktop/navegadores sem suporte a compartilhar arquivo): baixa a imagem via link `<a download>` sintético — sem dependência nova.

Estado de carregamento simples (spinner ou ícone estático desabilitado) enquanto a imagem é buscada, já que a geração não é instantânea.

## Integração na home

Em `src/app/(app)/home/page.tsx`, o `<ManaShareButton data={mana.data} referencia={mana.referencia}>` entra ao lado do `<ManaAudioButton>` já existente, no mesmo canto superior direito da seção "Maná Diário" — os dois ícones de ação agrupados, só renderizam se `mana` existir (o share não depende de `mana.urlAudio`, só da linha existir).

## Fora de escopo (YAGNI)

- Compartilhamento de Meditações e Sons (só Maná Diário por enquanto).
- Botão exclusivo/forçado de WhatsApp (wa.me) — descartado porque só manda texto, não a imagem.
- Cartões para dias diferentes do atual a partir da UI (a rota aceita `?data=` genérico, mas a UI só aciona para o dia mostrado na home).
- Personalização do texto do card por usuário (é sempre o texto oficial do dia).
