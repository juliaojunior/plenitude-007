"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import AudioPlayer from "@/components/AudioPlayer";
import { useAuth } from "@/contexts/AuthContext";

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

// Interface para favorito
interface Favorito {
  id: string;
  titulo: string;
  categoria: string;
  dataSalvo: string;
}

// Mapeamento de categorias para slugs
const categoriasParaSlugs: {[key: string]: string} = {
  // Nomes com inicial maiúscula (como vêm do admin)
  "Gratidão": "agradecer",
  "Ansiedade": "ansiedade",
  "Foco": "foco",
  "Paz": "paz",
  "Sabedoria": "sabedoria",
  "Sono": "sono",
  
  // Já em formato de slug (para compatibilidade)
  "agradecer": "agradecer",
  "ansiedade": "ansiedade",
  "foco": "foco",
  "paz": "paz",
  "sabedoria": "sabedoria",
  "sono": "sono"
};

// Mapeamento de slugs para nomes amigáveis
const slugsParaNomes: {[key: string]: string} = {
  "agradecer": "Gratidão",
  "ansiedade": "Ansiedade",
  "foco": "Foco",
  "paz": "Paz",
  "sabedoria": "Sabedoria",
  "sono": "Sono"
};

export default function MeditacaoDinamicaPage() {
  const params = useParams();
  const id = params.id as string;
  
  // Extrair a categoria da URL
  // O formato da URL é /meditacoes/[categoria]/[id]
  // Então params deve ter uma estrutura como { categoria: "agradecer", id: "abc123" }
  const categoriaFromUrl = Array.isArray(params.categoria) 
    ? params.categoria[0] 
    : (params.categoria as string || "");
  
  const { user } = useAuth();
  const [meditacao, setMeditacao] = useState<Meditacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorito, setIsFavorito] = useState(false);
  const [salvandoFavorito, setSalvandoFavorito] = useState(false);
  const [categoriaSegura, setCategoriaSegura] = useState<string>(categoriaFromUrl || "agradecer");

  // Função para converter categoria para slug
  const converterParaSlug = (categoria: string): string => {
    return categoriasParaSlugs[categoria] || "agradecer";
  };

  // Função para obter o nome amigável da categoria
  const getNomeCategoria = (slug: string): string => {
    return slugsParaNomes[slug] || "Meditações";
  };

  // Efeito para verificar se a meditação já é favorita
  useEffect(() => {
    const verificarFavorito = async () => {
      if (!user || !id) return;
      
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const favoritos = userData.favoritos || [];
          setIsFavorito(favoritos.some((fav: Favorito) => fav.id === id));
        }
      } catch (err) {
        console.error("Erro ao verificar favoritos:", err);
      }
    };
    
    verificarFavorito();
  }, [user, id]);

  useEffect(() => {
    const fetchMeditacao = async () => {
      if (!db) return;
      
      try {
        // Primeiro, tentamos buscar pelo ID exato
        const meditacaoRef = doc(db, "meditacoes", id);
        const meditacaoSnap = await getDoc(meditacaoRef);
        
        if (meditacaoSnap.exists()) {
          const data = meditacaoSnap.data();
          
          // Converter a categoria para slug
          const categoriaOriginal = data.categoria || categoriaFromUrl || "agradecer";
          const categoriaSlug = converterParaSlug(categoriaOriginal);
          
          setCategoriaSegura(categoriaSlug);
          
          setMeditacao({
            id: meditacaoSnap.id,
            titulo: data.titulo,
            textoBiblico: data.textoBiblico || "Deem graças em todas as circunstâncias, pois esta é a vontade de Deus para vocês em Cristo Jesus. (1 Tessalonicenses 5:18)",
            referenciaBiblica: data.referenciaBiblica,
            texto: data.texto,
            urlAudio: data.urlAudio || "/audio/placeholder_meditacao.mp3",
            categoria: categoriaSlug // Usar o slug, não o valor original
          });
        } else {
          // Se não encontrar pelo ID exato, verificamos se é uma das meditações estáticas
          // Isso mantém a compatibilidade com as meditações pré-existentes
          if (id === "agradecer001") {
            setCategoriaSegura("agradecer");
            setMeditacao({
              id: "agradecer001",
              titulo: "Cultivando a Gratidão Diária",
              textoBiblico: "Deem graças em todas as circunstâncias, pois esta é a vontade de Deus para vocês em Cristo Jesus. (1 Tessalonicenses 5:18)",
              urlAudio: "/audio/placeholder_meditacao.mp3",
              categoria: "agradecer"
            });
          } else if (id === "agradecer002") {
            setCategoriaSegura("agradecer");
            setMeditacao({
              id: "agradecer002",
              titulo: "Agradecendo Pelas Pequenas Coisas",
              textoBiblico: "Aquele que não poupou seu próprio Filho, mas o entregou por todos nós, como não nos dará juntamente com ele, e de graça, todas as coisas? (Romanos 8:32)",
              urlAudio: "/audio/placeholder_meditacao.mp3",
              categoria: "agradecer"
            });
          } else if (id === "agradecer003") {
            setCategoriaSegura("agradecer");
            setMeditacao({
              id: "agradecer003",
              titulo: "Meditação do Coração Grato",
              textoBiblico: "Entrem por suas portas com ações de graças, e em seus átrios, com louvor; deem-lhe graças e bendigam o seu nome. (Salmos 100:4)",
              urlAudio: "/audio/placeholder_meditacao.mp3",
              categoria: "agradecer"
            });
          } else if (id === "agradecer004") {
            setCategoriaSegura("agradecer");
            setMeditacao({
              id: "agradecer004",
              titulo: "Escrevendo um Diário de Gratidão",
              textoBiblico: "Alegrem-se sempre. Orem continuamente. Deem graças em todas as circunstâncias, pois esta é a vontade de Deus para vocês em Cristo Jesus. (1 Tessalonicenses 5:16-18)",
              urlAudio: "/audio/placeholder_meditacao.mp3",
              categoria: "agradecer"
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
  }, [id, categoriaFromUrl]);

  // Função para alternar favorito (adicionar/remover)
  const toggleFavorito = async () => {
    if (!user || !meditacao) return;
    
    setSalvandoFavorito(true);
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const favoritos = userData.favoritos || [];
        
        if (isFavorito) {
          // Remover dos favoritos
          const novosFavoritos = favoritos.filter((fav: Favorito) => fav.id !== meditacao.id);
          await updateDoc(userDocRef, { favoritos: novosFavoritos });
          setIsFavorito(false);
        } else {
          // Adicionar aos favoritos
          const novoFavorito = {
            id: meditacao.id,
            titulo: meditacao.titulo,
            categoria: meditacao.categoria,
            dataSalvo: new Date().toISOString()
          };
          
          await updateDoc(userDocRef, {
            favoritos: arrayUnion(novoFavorito)
          });
          
          setIsFavorito(true);
        }
      } else {
        // Se o documento do usuário não existir, criamos um novo com o favorito
        await updateDoc(userDocRef, {
          displayName: user.displayName,
          email: user.email,
          role: "user",
          createdAt: new Date().toISOString(),
          favoritos: [{
            id: meditacao.id,
            titulo: meditacao.titulo,
            categoria: meditacao.categoria,
            dataSalvo: new Date().toISOString()
          }]
        });
        
        setIsFavorito(true);
      }
    } catch (err) {
      console.error("Erro ao atualizar favoritos:", err);
      alert("Não foi possível atualizar seus favoritos. Tente novamente.");
    } finally {
      setSalvandoFavorito(false);
    }
  };

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
              href={`/meditacoes/${categoriaSegura}`}
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
                href={`/meditacoes/${categoriaSegura}`}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-300"
              >
                Voltar para Meditações de {getNomeCategoria(categoriaSegura)}
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
        {/* Cabeçalho com botão de voltar, título da meditação e botão de favorito */}
        <div className="flex items-center mb-6">
          <Link 
            href={`/meditacoes/${meditacao.categoria}`}
            className="text-blue-400 hover:text-blue-300 mr-4 p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 flex-1">
            {meditacao.titulo}
          </h1>
          
          {/* Botão de Favorito */}
          {user && (
            <button
              onClick={toggleFavorito}
              disabled={salvandoFavorito}
              className={`p-2 rounded-full transition-all duration-300 ${
                isFavorito 
                  ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
              }`}
              aria-label={isFavorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart 
                size={24} 
                className={`transition-transform duration-300 ${isFavorito ? 'fill-current scale-110' : 'scale-100'}`} 
              />
            </button>
          )}
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
            href={`/meditacoes/${meditacao.categoria}`}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-300"
          >
            Voltar para Meditações de {getNomeCategoria(meditacao.categoria)}
          </Link>
        </div>
      </div>
    </div>
  );
}
