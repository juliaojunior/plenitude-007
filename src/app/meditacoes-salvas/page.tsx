'use client';

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute"; // Componente para proteger a rota
import Navbar from "@/components/Navbar"; // Componente da barra de navegação
import { useAuth } from "@/contexts/AuthContext"; // Hook para acessar informações do usuário
import Link from "next/link";
import { Play, Heart, Clock, ArrowRight } from "lucide-react";
import { buscarFavoritos, Favorito } from "@/utils/favoritos-utils";

// --- Ícone para Meditações Salvas ---
const IconSalvas = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.636l-1.318-1.318a4.5 4.5 0 00-6.364 0L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636" opacity="0.4"/>
  </svg>
);

// Função para formatar a data
const formatarData = (dataString: string): string => {
  try {
    const data = new Date(dataString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(data);
  } catch (e) {
    return "Data desconhecida";
  }
};

// --- Componente de Conteúdo da Página Meditações Salvas ---
function MeditacoesSalvasPageContent() {
  const { user } = useAuth();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Buscar favoritos do usuário
  useEffect(() => {
    const carregarFavoritos = async () => {
      if (!user) {
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        const favoritosUsuario = await buscarFavoritos(user.uid);
        
        // Ordenar por data mais recente primeiro
        const favoritosOrdenados = [...favoritosUsuario].sort((a, b) => {
          return new Date(b.dataSalvo).getTime() - new Date(a.dataSalvo).getTime();
        });
        
        setFavoritos(favoritosOrdenados);
        setErro(null);
      } catch (err) {
        console.error("Erro ao carregar favoritos:", err);
        setErro("Não foi possível carregar suas meditações salvas. Tente novamente mais tarde.");
      } finally {
        setCarregando(false);
      }
    };

    carregarFavoritos();
  }, [user]);

  // Mapeamento de categorias para nomes amigáveis
  const categoriaNomes: {[key: string]: string} = {
    agradecer: "Gratidão",
    ansiedade: "Ansiedade",
    foco: "Foco",
    paz: "Paz",
    sabedoria: "Sabedoria",
    sono: "Sono"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white flex flex-col items-center pt-10 pb-24 px-4">
      <header className="mb-10 text-center w-full max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Meditações Salvas
        </h1>
        {user && (
          <p className="mt-2 text-sm text-blue-300">
            Suas meditações favoritas, {user.displayName || user.email}.
          </p>
        )}
      </header>

      <main className="w-full max-w-3xl">
        {carregando ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
          </div>
        ) : erro ? (
          <div className="text-center bg-gray-800 bg-opacity-70 p-8 rounded-xl shadow-xl">
            <p className="text-red-400 mb-4">{erro}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : favoritos.length > 0 ? (
          <div className="space-y-4">
            {favoritos.map((favorito) => (
              <div 
                key={favorito.id}
                className="bg-gray-800 bg-opacity-70 p-4 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <Link 
                      href={`/meditacoes/${favorito.categoria}/${favorito.id}`}
                      className="block"
                    >
                      <h3 className="font-medium text-gray-200 text-lg hover:text-blue-300 transition-colors">
                        {favorito.titulo}
                      </h3>
                    </Link>
                    <div className="flex items-center mt-1 text-sm text-gray-400">
                      <span className="bg-purple-900 text-purple-200 px-2 py-0.5 rounded-md mr-3">
                        {categoriaNomes[favorito.categoria] || favorito.categoria}
                      </span>
                      <Clock size={14} className="mr-1" />
                      <span>Salvo em {formatarData(favorito.dataSalvo)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link 
                      href={`/meditacoes/${favorito.categoria}/${favorito.id}`}
                      className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
                      aria-label="Ouvir meditação"
                    >
                      <Play size={18} fill="white" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-gray-800 bg-opacity-70 p-8 rounded-xl shadow-xl">
            <IconSalvas />
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">Nenhuma Meditação Salva</h2>
            <p className="text-gray-400 mb-6">
              Você ainda não marcou nenhuma meditação como favorita. Explore as categorias e salve as que mais gostar!
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-300"
            >
              Explorar Meditações <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}

// Envolve o conteúdo da página com o ProtectedRoute
export default function MeditacoesSalvasPage() {
  return (
    <ProtectedRoute>
      <MeditacoesSalvasPageContent />
    </ProtectedRoute>
  );
}
