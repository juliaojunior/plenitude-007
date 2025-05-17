"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import AudioPlayer from "@/components/AudioPlayer";

// Interface para a meditação
interface Meditacao {
  id: string;
  titulo: string;
  textoBiblico?: string;
  referenciaBiblica?: string;
  texto?: string;
  audioUrl: string;
  categoria: string;
  categoriaNome: string;
}

export default function MeditacaoDinamicaPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [meditacao, setMeditacao] = useState<Meditacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeditacao = async () => {
      if (!db || !id) return;
      
      try {
        setLoading(true);
        const meditacaoRef = doc(db, "meditacoes", id);
        const meditacaoSnap = await getDoc(meditacaoRef);
        
        if (meditacaoSnap.exists()) {
          const data = meditacaoSnap.data();
          
          // Mapear categoria para URL e nome de exibição
          let categoriaUrl = "ansiedade";
          let categoriaNome = "Ansiedade";
          
          if (data.categoria) {
            switch(data.categoria.toLowerCase()) {
              case "gratidão":
                categoriaUrl = "agradecer";
                categoriaNome = "Gratidão";
                break;
              case "ansiedade":
                categoriaUrl = "ansiedade";
                categoriaNome = "Ansiedade";
                break;
              case "foco":
                categoriaUrl = "foco";
                categoriaNome = "Foco";
                break;
              case "paz":
                categoriaUrl = "paz";
                categoriaNome = "Paz";
                break;
              case "sabedoria":
                categoriaUrl = "sabedoria";
                categoriaNome = "Sabedoria";
                break;
              case "sono":
                categoriaUrl = "sono";
                categoriaNome = "Sono";
                break;
              default:
                categoriaUrl = data.categoria.toLowerCase().replace(/\s+/g, "-");
                categoriaNome = data.categoria;
            }
          }
          
          setMeditacao({
            id: meditacaoSnap.id,
            titulo: data.titulo || "Meditação sem título",
            textoBiblico: data.textoBiblico || "Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus. (Filipenses 4:6-7)",
            referenciaBiblica: data.referenciaBiblica,
            texto: data.texto,
            audioUrl: data.urlAudio || "/audio/placeholder_meditacao.mp3",
            categoria: categoriaUrl,
            categoriaNome: categoriaNome
          });
        } else {
          setError("Meditação não encontrada");
        }
      } catch (err) {
        console.error("Erro ao buscar meditação:", err);
        setError("Não foi possível carregar os dados da meditação");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeditacao();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-blue-300">Carregando meditação...</p>
        </div>
      </div>
    );
  }

  if (error || !meditacao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white p-4 sm:p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Link 
              href="/meditacoes/ansiedade"
              className="text-blue-400 hover:text-blue-300 mr-4 p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Erro
            </h1>
          </div>
          
          <div className="p-6 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-lg shadow-lg">
            <p className="text-red-400">{error || "Meditação não encontrada"}</p>
            <div className="mt-6">
              <Link 
                href="/meditacoes/ansiedade"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-300"
              >
                Voltar para Meditações
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        {meditacao.textoBiblico && (
          <div className="mb-8 p-6 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-blue-300 mb-3">Texto Bíblico de Inspiração</h2>
            <p className="text-gray-300 leading-relaxed italic">
              {meditacao.textoBiblico}
            </p>
            {meditacao.referenciaBiblica && (
              <p className="text-right text-sm text-gray-400 mt-2">- {meditacao.referenciaBiblica}</p>
            )}
          </div>
        )}
        
        {/* Player de Áudio */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-300 mb-4 px-6">Ouça a Meditação</h2>
          <AudioPlayer src={meditacao.audioUrl} title={meditacao.titulo} />
          <p className="text-xs text-gray-500 mt-2 px-6">
            Ouça esta meditação em um ambiente tranquilo para melhor experiência.
          </p>
        </div>
        
        {/* Texto da Meditação (se disponível) */}
        {meditacao.texto && (
          <div className="mb-8 p-6 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-blue-300 mb-3">Transcrição</h2>
            <div className="text-gray-300 leading-relaxed whitespace-pre-line">
              {meditacao.texto}
            </div>
          </div>
        )}
        
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
