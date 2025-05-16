// Componente Navbar
// Este componente renderiza a barra de navegação inferior, permitindo a navegação
// entre as telas principais da aplicação e o logout do usuário.

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Hooks para obter o caminho atual e para navegação
import { useAuth } from '@/contexts/AuthContext'; // Hook para acessar funções de autenticação

// --- Ícones para a Navbar ---
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const SavedMeditationsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    {/* Ícone de bookmark/salvar */}
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ExitIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function Navbar() {
  const { signOut } = useAuth(); // Obtém a função de logout do contexto de autenticação
  const router = useRouter();
  const pathname = usePathname(); // Obtém o caminho da URL atual para destacar o link ativo

  // Função para lidar com o logout do usuário
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login'); // Redireciona para a tela de login após o logout
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Adicionar feedback para o usuário em caso de erro no logout
    }
  };

  // Define os itens da navbar
  const navItems = [
    { href: '/', label: 'Início', icon: <HomeIcon /> },
    { href: '/meditacoes-salvas', label: 'Salvas', icon: <SavedMeditationsIcon /> },
    { href: '/perfil', label: 'Perfil', icon: <ProfileIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-lg z-50">
      <div className="max-w-md mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around h-16">
          {/* Mapeia os itens de navegação para criar os links */}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-110 
                            ${isActive ? 'text-blue-400 scale-110' : 'text-gray-400 hover:text-blue-300'}`}
              >
                {item.icon}
                <span className={`mt-1 ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
          {/* Botão de Sair */}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-red-400 transition-all duration-300 ease-in-out transform hover:scale-110"
            aria-label="Sair da aplicação"
          >
            <ExitIcon />
            <span className="mt-1">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

