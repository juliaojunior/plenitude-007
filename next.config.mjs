// Configuração do Next.js com PWA
// Este arquivo configura o Next.js para habilitar funcionalidades de Progressive Web App (PWA)
// utilizando a biblioteca `next-pwa`.

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Ativa o Modo Estrito do React para ajudar a identificar problemas potenciais
  // Outras configurações do Next.js podem ser adicionadas aqui
};

// Importa a função para configurar o PWA usando a sintaxe de Módulo ES
import nextPwa from "next-pwa";

// Configuração específica para o next-pwa
const pwaConfig = {
  dest: "public", // Diretório de destino para os arquivos do service worker e manifest
  register: true, // Registra automaticamente o service worker
  skipWaiting: true, // Faz com que o novo service worker ative imediatamente
  disable: process.env.NODE_ENV === "development", // Desabilita o PWA em ambiente de desenvolvimento para facilitar o debug
  // runtimeCaching: [], // (Opcional) Você pode definir estratégias de cache em tempo de execução aqui
  // buildExcludes: [/middleware-manifest.json$/], // (Opcional) Excluir arquivos específicos do precache
  fallbacks: {
    // (Opcional) Define fallbacks para quando o recurso não está disponível offline
    // document: "/_offline", // Exemplo: uma página offline customizada em /pages/_offline.tsx
    // image: "/fallback-image.png",
    // font: "/fallback-font.woff2",
  },
  // (Opcional) Outras configurações do next-pwa podem ser adicionadas aqui
  // Consulte a documentação do `next-pwa` para mais opções.
};

// Envolve a configuração do Next.js com a configuração do PWA
const withPWA = nextPwa(pwaConfig);

// Exporta a configuração final
export default withPWA(nextConfig);

