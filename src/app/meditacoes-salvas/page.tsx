// Página de Meditações Salvas
// Esta página exibirá as meditações que o usuário marcou como favoritas.
// Inicialmente, mostrará uma mensagem indicando que a funcionalidade está em desenvolvimento ou que não há meditações salvas.

'use client';

import ProtectedRoute from "@/components/ProtectedRoute"; // Componente para proteger a rota
import Navbar from "@/components/Navbar"; // Componente da barra de navegação
import { useAuth } from "@/contexts/AuthContext"; // Hook para acessar informações do usuário (se necessário)

// --- Ícone para Meditações Salvas (Exemplo) ---
const IconSalvas = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.636l-1.318-1.318a4.5 4.5 0 00-6.364 0L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636" opacity="0.4"/>
  </svg>
);

// --- Componente de Conteúdo da Página Meditações Salvas ---
function MeditacoesSalvasPageContent() {
  const { user } = useAuth(); // Pode ser usado para buscar meditações salvas específicas do usuário no futuro

  // Placeholder para meditações salvas - no futuro, viria de um estado ou API
  const meditacoesSalvas: unknown[] = []; // Array vazio por enquanto

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
        {meditacoesSalvas.length > 0 ? (
          <div className="space-y-4">
            {/* Aqui seria o mapeamento das meditações salvas, similar à seção de "Últimas Meditações" */}
            {/* Exemplo de item:
            <div className="bg-gray-800 bg-opacity-70 p-4 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-200">Nome da Meditação Salva</h3>
                <p className="text-sm text-gray-400">Duração</p>
              </div>
              <button className="p-2 rounded-full hover:bg-purple-600 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> 
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /> 
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> 
                </svg>
              </button>
            </div>
            */}
          </div>
        ) : (
          <div className="text-center bg-gray-800 bg-opacity-70 p-8 rounded-xl shadow-xl">
            <IconSalvas />
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">Nenhuma Meditação Salva</h2>
            <p className="text-gray-400">
              Você ainda não marcou nenhuma meditação como favorita. Explore as categorias e salve as que mais gostar!
            </p>
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

