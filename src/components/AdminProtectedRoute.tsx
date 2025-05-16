// src/components/AdminProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver carregando e o usuário não estiver logado, ou se estiver logado mas não for admin
    if (!loading && (!user || !isAdmin)) {
      console.log("AdminProtectedRoute: Usuário não é admin ou não está logado. Redirecionando...");
      router.push("/login"); // Redireciona para a página de login
    }
  }, [user, isAdmin, loading, router]);

  // Se estiver carregando ou se o usuário não for admin (e ainda não foi redirecionado)
  if (loading || !user || !isAdmin) {
    // Pode mostrar uma tela de carregamento ou null enquanto verifica
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-xl">Verificando permissões...</p>
      </div>
    );
  }

  // Se o usuário for admin e estiver logado, renderiza os componentes filhos
  return <>{children}</>;
};

export default AdminProtectedRoute;

