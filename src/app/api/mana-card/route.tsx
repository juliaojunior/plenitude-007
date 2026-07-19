import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { manadiario } from "@/lib/db/schema"

export const runtime = "nodejs"

function primeiraFrase(comentario: string): string {
  const frase = comentario.split(/(?<=[.!?…])\s+/)[0]?.trim() ?? ""
  return frase.length > 140 ? frase.slice(0, 137).trimEnd() + "…" : frase
}

function saudacao(): string {
  const hora = new Date().getHours()
  return hora < 12 ? "BOM DIA" : hora < 18 ? "BOA TARDE" : "BOA NOITE"
}

// ponytail: 3 níveis por comprimento do versículo (caixa de altura fixa no template).
// Cobre a distribuição real dos 60 Manás (a maioria <=163 chars); acima de 170, esconde
// a reflexão pra abrir espaço e nunca corta o texto bíblico. Se a distribuição mudar
// muito (versículos bem mais longos), ajustar os limiares ou os tamanhos de fonte.
function tierFor(verseLen: number) {
  if (verseLen <= 110) return { verseSize: 19, showReflection: true, reflectionSize: 15 }
  if (verseLen <= 170) return { verseSize: 16, showReflection: true, reflectionSize: 13 }
  return { verseSize: 13, showReflection: false, reflectionSize: 0 }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const data = searchParams.get("data")
  if (!data) {
    return new Response("Parâmetro 'data' obrigatório", { status: 400 })
  }

  const [mana] = await db.select().from(manadiario).where(eq(manadiario.data, data)).limit(1)
  if (!mana) {
    return new Response("Maná não encontrado para essa data", { status: 404 })
  }
  const tier = tierFor(mana.textoBiblico.length)

  const fontsDir = join(process.cwd(), "src/assets/fonts/cormorant-garamond")
  const [bgBase64, regular, bold, italic] = await Promise.all([
    readFile(join(process.cwd(), "public/cardRefugio_02.png"), "base64"),
    readFile(join(fontsDir, "CormorantGaramond-Regular.ttf")),
    readFile(join(fontsDir, "CormorantGaramond-Bold.ttf")),
    readFile(join(fontsDir, "CormorantGaramond-Italic.ttf")),
  ])
  const bgSrc = `data:image/png;base64,${bgBase64}`

  return new ImageResponse(
    (
      <div style={{ position: "relative", width: 506, height: 912, display: "flex" }}>
        <img
          src={bgSrc}
          width={506}
          height={912}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        <div
          style={{
            position: "absolute",
            top: 470,
            left: 0,
            width: 506,
            height: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Cormorant Garamond",
              fontWeight: 700,
              fontSize: 30,
              color: "#D4AA5F",
              letterSpacing: 2,
            }}
          >
            {`${saudacao()}, CORAÇÃO!`}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 605,
            left: 58,
            width: 392,
            height: 210,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 12px",
          }}
        >
          <div
            style={{
              fontFamily: "Cormorant Garamond",
              fontWeight: 700,
              fontSize: 24,
              color: "#5C3D1F",
              marginBottom: 10,
            }}
          >
            {mana.referencia}
          </div>
          <div
            style={{
              fontFamily: "Cormorant Garamond",
              fontStyle: "italic",
              fontSize: tier.verseSize,
              color: "#3A2E1F",
              lineHeight: 1.35,
              marginBottom: tier.showReflection ? 14 : 0,
            }}
          >
            {`“${mana.textoBiblico}”`}
          </div>
          {tier.showReflection && mana.comentario && (
            <div
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: tier.reflectionSize,
                color: "#4A3B28",
                lineHeight: 1.4,
              }}
            >
              {primeiraFrase(mana.comentario)}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 506,
      height: 912,
      fonts: [
        { name: "Cormorant Garamond", data: regular, weight: 400, style: "normal" },
        { name: "Cormorant Garamond", data: bold, weight: 700, style: "normal" },
        { name: "Cormorant Garamond", data: italic, weight: 400, style: "italic" },
      ],
      headers: { "Cache-Control": "public, max-age=3600" },
    }
  )
}
