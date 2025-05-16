// src/app/meditacoes/ansiedade/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react"; // Ícone para voltar
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

// Interface para representar uma meditação
interface Meditacao {
  id: string;
  titulo: string;
  descricao?: string;
  texto?: string;
  categoria: string;
}

// Dados de exemplo para as meditações de Ansiedade (serão usados como fallback)
const meditacoesAnsiedadeStatic: Meditacao[] = [
  {
    id: "ansiedade001",
    titulo: "Respiração Consciente para Acalmar",
    descricao: "Uma prática guiada para focar na sua respiração e encontrar calma.",
    categoria: "ansiedade",
  },
  {
    id: "ansiedade002",
    titulo: "Liberando a Tensão Corporal",
    descricao: "Solte as tensões acumuladas no corpo e relaxe profundamente.",
    categoria: "ansiedade",
  },
  {
    id: "ansiedade003",
    titulo: "Visualização de um Lugar Seguro",
    descricao: "Crie um refúgio mental para momentos de ansiedade.",
    categoria: "ansiedade",
  },
  {
    id: "ansiedade004",
    titulo: "Aceitando o Momento Presente",
    descricao: "Aprenda a acolher suas emoções sem julgamento.",
    categoria: "ansiedade",
  },
];

export default function MeditacoesAnsiedadePage() {
  const [meditacoes, setMeditacoes] = useState<Meditacao[]>(meditacoesAnsiedadeStatic);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeditacoes = async () => {
      if (!db) return;
      
      try {
        const meditacoesRef = collection(db, "meditacoes");
        const q = query(
          meditacoesRef, 
          where("categoria", "==", "Ansiedade"),
          orderBy("titulo")
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const meditacoesData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              titulo: data.titulo,
              descricao: data.texto?.substring(0, 100) + "..." || "Sem descrição disponível",
              texto: data.texto,
              categoria: "ansiedade" // Garantindo que a categoria esteja em minúsculo para o link
            };
          });
          
          setMeditacoes(meditacoesData);
        }
      } catch (err) {
        console.error("Erro ao buscar meditações:", err);
        setError("Não foi possível carregar as meditações. Usando dados locais.");
        // Mantém os dados estáticos como fallback
      } finally {
        setLoading(false);
      }
    };

    fetchMeditacoes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Cabeçalho com botão de voltar e título */}
        <div className="flex items-center mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Meditações para Ansiedade
          </h1>
        </div>

        {/* Estado de carregamento */}
        {loading && (
          <div className="text-center py-10">
            <p className="text-blue-300">Carregando meditações...</p>
          </div>
        )}

        {/* Mensagem de erro (se houver) */}
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Lista de Meditações */}
        <div className="space-y-6">
          {!loading && meditacoes.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              Nenhuma meditação encontrada para esta categoria.
            </p>
          ) : (
            meditacoes.map((meditacao) => (
              <Link
                key={meditacao.id}
                href={`/meditacoes/${meditacao.categoria}/${meditacao.id}`}
                className="block p-6 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-lg shadow-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
              >
                <h2 className="text-xl font-semibold text-blue-300 mb-2">
                  {meditacao.titulo}
                </h2>
                <p className="text-gray-400 text-sm">{meditacao.descricao}</p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
