// Arquivo de Layout Principal
// Este arquivo define o layout raiz da aplicação Next.js.
// Ele inclui a estrutura HTML básica, importa fontes, e envolve a aplicação com o AuthProvider.

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Importa os estilos globais (incluindo Tailwind CSS)
import { AuthProvider } from "@/contexts/AuthContext"; // Importa o provedor de autenticação

// Configuração da fonte Inter do Google Fonts
const inter = Inter({ subsets: ["latin"] });

// Metadados da aplicação (título, descrição)
// Estes metadados são importantes para SEO e para a aba do navegador.
export const metadata: Metadata = {
  title: "PLENITUDE PWA", // Título da aplicação
  description: "Um PWA para promover o bem-estar.", // Descrição da aplicação
};

// Componente de Layout Raiz
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; // Conteúdo da página atual
}>) {
  return (
    <html lang="pt-BR">
      {/* 
        A tag <head> é automaticamente gerenciada pelo Next.js com base nos metadados e outros imports.
        Não adicione conteúdo diretamente aqui como texto ou espaços, pois pode causar erros de hidratação.
        O conteúdo do <head> (como links para fontes, meta tags) deve ser gerenciado pelo Next.js ou pelo objeto `metadata`.
      */}
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

