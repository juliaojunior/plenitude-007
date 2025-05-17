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
  urlAudio?: string;
  categoria: string;
}

export default function MeditacaoDinamicaPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [meditacao, setMeditacao] = useState<Meditacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeditacao = async () => {
      if (!db) return;
      
      try {
        // Primeiro, tentamos buscar pelo ID exato
        const meditacaoRef = doc(db, "meditacoes", id);
        const meditacaoSnap = await getDoc(meditacaoRef);
        
        if (meditacaoSnap.exists()) {
          const data = meditacaoSnap.data();
          setMeditacao({
            id: meditacaoSnap.id,
            titulo: data.titulo,
            textoBiblico: data.textoBiblico || "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize. (João 14:27)",
            referenciaBiblica: data.referenciaBiblica,
            texto: data.texto,
            urlAudio: data.urlAudio || "/audio/placeholder_meditacao.mp3",
            categoria: "paz"
          });
        } else {
          // Se não encontrar pelo ID exato, verificamos se é uma das meditações estáticas
          // Isso mantém a compatibilidade com as meditações pré-existentes
          if (id === "paz001") {
            setMeditacao({
              id: "paz001",
              titulo: "Encontrando Paz Interior",
              textoBiblico: "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize. (João 14:27)",
              urlAudio: "/audio/placeholder_meditacao.mp3",
              categoria: "paz"
            });
          } else if (id === "paz002") {
            setMeditacao({
              id: "paz002",
              titulo: "Paz nas Tempestades",
              textoBiblico: "Ele acalmou a tempestade, e as ondas se aquietaram. Eles se alegraram quando as águas se acalmaram, e Deus os guiou ao porto almejado. (Salmos 107:29-30)",
              urlAudio: "/audio/placeholder_meditacao.mp3",
              categoria: "paz"
            });
          } else if (id === "paz003") {
            setMeditacao({
              id: "paz003",
              titulo: "Cultivando a Serenidade",
              textoBiblico: "E a paz de Deus, que excede todo o entendimento, guardará os seus corações e as suas mentes em Cristo Jesus. (Filipenses 4:7)",
              urlAudio: "/audio/placeholder_meditacao.mp3",
              categoria: "paz"
            });
          } else if (id === "paz004") {
            setMeditacao({
              id: "paz004",
              titulo: "Paz em Meio ao Caos",
              textoBiblico: "Tu guardarás em perfeita paz aquele cujo propósito está firme, porque em ti confia. (Isaías 26:3)",
              urlAudio: "/audio/placeholder_meditacao.mp3",
              categoria: "paz"
            });
          } else {
            setError("Meditação não encontrada");
          }
        }
      } catch (err) {
        console.error("Erro ao buscar meditação:", err);
        setError("Não foi possível carregar a meditação");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeditacao();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <p className="text-xl text-blue-300">Carregando meditação...</p>
      </div>
    );
  }

  if (error || !meditacao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white p-4 sm:p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Link 
              href="/meditacoes/paz"
              className="text-blue-400 hover:text-blue-300 mr-4 p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Meditação não encontrada
            </h1>
          </div>
          <div className="p-6 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-lg shadow-lg">
            <p className="text-gray-300">
              {error || "Esta meditação não está disponível no momento. Por favor, tente outra meditação."}
            </p>
            <div className="mt-6">
              <Link 
                href="/meditacoes/paz"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-300"
              >
                Voltar para Meditações de Paz
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
            href="/meditacoes/paz"
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
          {meditacao.referenciaBiblica && (
            <p className="text-right text-sm text-gray-400 mt-2">- {meditacao.referenciaBiblica}</p>
          )}
        </div>
        
        {/* Player de Áudio */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-300 mb-4 px-6">Ouça a Meditação</h2>
          <AudioPlayer src={meditacao.urlAudio || "/audio/placeholder_meditacao.mp3"} title={meditacao.titulo} />
          <p className="text-xs text-gray-500 mt-2 px-6">
            {meditacao.urlAudio === "/audio/placeholder_meditacao.mp3" && 
              "Nota: Este é um áudio de exemplo. Em uma versão completa, cada meditação teria seu próprio arquivo de áudio."}
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
            href="/meditacoes/paz"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-300"
          >
            Voltar para Meditações de Paz
          </Link>
        </div>
      </div>
    </div>
  );
}
