// src/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Interface para as estatísticas do aplicativo
interface AppStats {
  userCount: number;
  meditationCount: number;
  manaCount: number;
  loading: boolean;
}

export default function AdminDashboardPage() {
  // Estado para armazenar as estatísticas
  const [stats, setStats] = useState<AppStats>({
    userCount: 0,
    meditationCount: 0,
    manaCount: 0,
    loading: true
  });

  // Efeito para buscar as estatísticas do Firestore
  useEffect(() => {
    const fetchStats = async () => {
      if (!db) {
        console.error("Firestore não está inicializado");
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Buscar contagem de usuários
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const userCount = usersSnapshot.size;

        // Buscar contagem de meditações
        const meditationsCollection = collection(db, "meditacoes");
        const meditationsSnapshot = await getDocs(meditationsCollection);
        const meditationCount = meditationsSnapshot.size;

        // Buscar contagem de manás diários
        const manaCollection = collection(db, "mana_diario");
        const manaSnapshot = await getDocs(manaCollection);
        const manaCount = manaSnapshot.size;

        // Atualizar o estado com as estatísticas
        setStats({
          userCount,
          meditationCount,
          manaCount,
          loading: false
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Dashboard do Administrador
          </h1>
        </header>

        <nav className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link href="/admin/mana-diario" className="block p-6 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
            <h2 className="text-2xl font-semibold text-blue-400 mb-2">Gerenciar Maná Diário</h2>
            <p className="text-gray-400">Adicionar, editar ou remover entradas do Maná Diário.</p>
          </Link>
          <Link href="/admin/meditacoes" className="block p-6 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
            <h2 className="text-2xl font-semibold text-purple-400 mb-2">Gerenciar Meditações</h2>
            <p className="text-gray-400">Adicionar, editar ou remover meditações.</p>
          </Link>
        </nav>

        <section>
          <h2 className="text-3xl font-semibold text-gray-300 mb-6">Estatísticas do Aplicativo</h2>
          
          {stats.loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Carregando estatísticas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-xl font-medium text-green-400 mb-2">Usuários Cadastrados</h3>
                <p className="text-3xl font-bold">{stats.userCount}</p>
              </div>
              <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-xl font-medium text-yellow-400 mb-2">Meditações Publicadas</h3>
                <p className="text-3xl font-bold">{stats.meditationCount}</p>
              </div>
              <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-xl font-medium text-indigo-400 mb-2">Manás Diários Agendados</h3>
                <p className="text-3xl font-bold">{stats.manaCount}</p>
              </div>
            </div>
          )}
        </section>
        
        <footer className="mt-12 text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 hover:underline">
            Voltar para a Página Principal
          </Link>
        </footer>
      </div>
    </AdminProtectedRoute>
  );
}
