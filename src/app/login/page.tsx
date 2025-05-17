// Página de Login
// Esta página permite que os usuários façam login na aplicação, principalmente usando o Google.

"use client"; // Indica que este é um Componente Cliente, necessário para interatividade

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Hook para navegação programática
import { useAuth } from "@/contexts/AuthContext"; // Hook customizado para acesso ao contexto de autenticação
import Image from "next/image"; // Removido pois não estava sendo usado e causava erro de lint no deploy anterior

// Componente da Página de Login
export default function LoginPage() {
  // Obtém o usuário, função de login, estado de carregamento e se é admin do contexto
  const { user, signInWithGoogle, loading, isAdmin } = useAuth(); 
  const router = useRouter(); // Instância do roteador Next.js

  // Efeito para redirecionar o usuário se já estiver logado
  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        router.push("/admin/dashboard"); // Redireciona admin para o dashboard
      } else {
        router.push("/"); // Redireciona usuário comum para a página inicial
      }
    }
  }, [user, loading, isAdmin, router]);

  // Função para lidar com o clique no botão de login com Google
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // O redirecionamento será tratado pelo useEffect acima após a atualização do estado do usuário e isAdmin
    } catch (error) {
      console.error("Erro ao tentar login com Google:", error);
      // Aqui você poderia exibir uma mensagem de erro para o usuário
    }
  };

  // Se ainda estiver carregando o estado de autenticação, exibe uma mensagem de carregamento
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-xl">Carregando...</p>
      </div>
    );
  }

  // Se o usuário já estiver logado (embora o useEffect deva redirecionar, é uma segurança extra)
  // Não renderiza nada, pois o useEffect cuidará do redirecionamento
  if (user) {
    return null; 
  }

  // Renderiza a tela de login
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
      <div className="bg-gray-800 p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105 duration-300">
        {/* Símbolo PWA - Placeholder circular */}
        <div className="mx-auto mb-8 w-40 h-40 flex items-center justify-center">
          <Image 
            src="/logoPlenitude.png" 
            alt="Logo Plenitude" 
            width={160} 
            height={160} 
            className="object-contain"
          />
        </div>



        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8">
          PLENITUDE
        </h1>

        {/* Inputs de Email e Senha (UI apenas, funcionalidade não implementada nesta etapa) */}
        <div className="mb-6">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">Email</label>
          <input 
            type="email" 
            id="email" 
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 placeholder-gray-400 transition-colors duration-300"
            placeholder="seuemail@exemplo.com" 
          />
        </div>

        <div className="mb-8">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">Senha</label>
          <input 
            type="password" 
            id="password" 
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 placeholder-gray-400 transition-colors duration-300"
            placeholder="••••••••" 
          />
        </div>
        
        <button 
          type="button" 
          className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-3 text-center mb-4 transition-transform transform hover:scale-105 duration-300 shadow-md hover:shadow-lg"
        >
          Entrar
        </button>

        {/* Botão de Login com Google */}
        <button 
          onClick={handleGoogleSignIn} 
          disabled={loading} 
          className="w-full text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 focus:ring-4 focus:outline-none focus:ring-red-400 font-medium rounded-lg text-sm px-5 py-3 text-center flex items-center justify-center mb-6 transition-transform transform hover:scale-105 duration-300 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5 mr-2 -ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C39.712,34.464,44,28.756,44,20C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
          Entrar com Google
        </button>

        <div className="text-center">
          <a href="/cadastro" className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300">
            Não tem uma conta? Registre-se
          </a>
        </div>
      </div>
    </div>
  );
}

