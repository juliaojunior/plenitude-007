// src/app/meditacoes/agradecer/agradecer003/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react"; // Ícone para voltar

// Dados da meditação
const meditacao = {
  id: "agradecer003",
  titulo: "Meditação do Coração Grato",
  textoBiblico: "Louvem o Senhor, porque ele é bom; o seu amor dura para sempre. (Salmos 136:1)",
  audioUrl: "/audio/placeholder_meditacao.mp3", // Caminho para um áudio de exemplo
  categoria: "agradecer",
  categoriaNome: "Agradecer"
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
        <div className="mb-8 p-6 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-blue-300 mb-4">Ouça a Meditação</h2>
          <audio controls className="w-full">
            <source src={meditacao.audioUrl} type="audio/mpeg" />
            Seu navegador não suporta o elemento de áudio.
          </audio>
          <p className="text-xs text-gray-500 mt-2">
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

