// Componente de Rota Protegida
// Este componente envolve páginas que exigem autenticação.
// Se o usuário não estiver logado, ele é redirecionado para a página de login.

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se o carregamento inicial da autenticação ainda não terminou, não faz nada
    if (loading) {
      return;
    }
    // Se não há usuário logado e o carregamento terminou, redireciona para o login
    if (!user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Se estiver carregando ou se não houver usuário (antes do redirecionamento)
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-xl">Carregando...</p>
      </div>
    );
  }

  // Se o usuário estiver logado, renderiza os componentes filhos
  return <>{children}</>;
};

export default ProtectedRoute;

