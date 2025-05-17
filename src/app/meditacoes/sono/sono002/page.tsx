// src/app/meditacoes/sono/sono002/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react"; // Ícone para voltar
import AudioPlayer from "@/components/AudioPlayer";

// Dados da meditação
const meditacao = {
  id: "sono002",
  titulo: "Contagem Regressiva para o Sono",
  textoBiblico: "Quando te deitares, não temerás; sim, tu te deitarás e o teu sono será suave. (Provérbios 3:24)",
  audioUrl: "/audio/placeholder_meditacao.mp3", // Caminho para um áudio de exemplo
  categoria: "sono",
  categoriaNome: "Sono"
};

export default function MeditacaoIndividualPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Cabeçalho com botão de voltar e título da meditação */}
        <div className="flex items-center mb-6">
          <Link 
            href={`/meditacoes/${meditacao.categoria}`}
            className="text-blue-400 hover:text-blue-300 mr-4 p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {meditacao.titulo}
          </h1>
        </div>

        {/* Texto Bíblico */}
        <div className="mb-8 p-6 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-blue-300 mb-3">Texto Bíblico de Inspiração</h2>
          <p className="text-gray-300 leading-relaxed italic">
            {meditacao.textoBiblico}
          </p>
        </div>

        {/* Player de Áudio */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-300 mb-4 px-6">Ouça a Meditação</h2>
          <AudioPlayer src={meditacao.audioUrl} title={meditacao.titulo} />
          <p className="text-xs text-gray-500 mt-2 px-6">
            Nota: Este é um áudio de exemplo. Em uma versão completa, cada meditação teria seu próprio arquivo de áudio.
          </p>
        </div>

        {/* Botão para voltar para a categoria */}
        <div className="text-center mt-10">
          <Link 
            href={`/meditacoes/${meditacao.categoria}`}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-300"
          >
            Voltar para Meditações de {meditacao.categoriaNome}
          </Link>
        </div>

      </div>
    </div>
  );
}

