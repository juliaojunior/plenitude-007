// Página de Perfil do Usuário
// Esta página exibe as informações do usuário logado, como nome, email e uma imagem de perfil personalizável.
// Também inclui a barra de navegação para outras seções e a opção de logout.

"use client";

import ProtectedRoute from "@/components/ProtectedRoute"; // Componente para proteger a rota
import Navbar from "@/components/Navbar"; // Componente da barra de navegação
import { useAuth } from "@/contexts/AuthContext"; // Hook para acessar informações do usuário
import Image from "next/image"; // Componente para otimização de imagens
import { useState, useEffect } from "react";
import { Edit3, X } from "lucide-react"; // Ícones para edição e fechar popup

// --- Ícone para a seção Jornada (Exemplo) ---
const IconJornada = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// Lista de ícones de perfil disponíveis
const profileIcons = [
  "/profile-icons/icon_nature_leaf.png",
  "/profile-icons/icon_wave_calm.png",
  "/profile-icons/icon_mountain_peak.png",
  "/profile-icons/icon_sun_horizon.png",
  "/profile-icons/icon_starry_sky.png",
  "/profile-icons/icon_abstract_lines.png",
];

// --- Componente de Conteúdo da Página de Perfil ---
function ProfilePageContent() {
  const { user } = useAuth(); // Obtém o usuário logado do contexto de autenticação
  const [showIconPopup, setShowIconPopup] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("/user-placeholder.svg"); // Ícone padrão

  // Efeito para carregar o ícone salvo do localStorage ao montar o componente
  useEffect(() => {
    const savedIcon = localStorage.getItem("userProfileIcon");
    if (savedIcon && profileIcons.includes(savedIcon)) {
      setSelectedIcon(savedIcon);
    }
  }, []);

  // Função para lidar com a seleção de um novo ícone
  const handleIconSelect = (iconPath: string) => {
    setSelectedIcon(iconPath);
    localStorage.setItem("userProfileIcon", iconPath); // Salva no localStorage
    setShowIconPopup(false); // Fecha o popup
  };

  // Se o usuário não estiver carregado
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-xl">Carregando informações do perfil...</p>
      </div>
    );
  }

  // Dados placeholder para a seção "Sua Jornada"
  const jornadaData = {
    diasConsecutivos: 7,
    meditacoesMes: 15,
    meditacoesAno: 120,
    meditacoesTotal: 250,
    minutosTotal: 2500,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-800 to-blue-900 text-white flex flex-col items-center pt-10 pb-24 px-4">
      <main className="w-full max-w-md">
        <div className="bg-gray-800 bg-opacity-80 p-6 md:p-10 rounded-xl shadow-2xl text-center mb-8 transform transition-all hover:scale-105 duration-300">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8">
            Meu Perfil
          </h1>

          {/* Imagem de Perfil Circular com Botão de Edição */}
          <div className="relative mx-auto mb-6 w-32 h-32 md:w-40 md:h-40">
            <div className="rounded-full overflow-hidden border-4 border-blue-500 shadow-lg bg-gray-700 flex items-center justify-center w-full h-full">
              <Image 
                src={selectedIcon} 
                alt="Foto do Perfil" 
                width={160} 
                height={160} 
                className="object-cover w-full h-full"
                priority
                key={selectedIcon} // Força a re-renderização da imagem ao mudar o src
              />
            </div>
            <button
              onClick={() => setShowIconPopup(true)}
              className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-md transition-transform transform hover:scale-110"
              aria-label="Editar ícone de perfil"
            >
              <Edit3 size={18} />
            </button>
          </div>

          {/* Nome do Usuário */}
          {user.displayName && (
            <h2 className="text-2xl font-semibold text-gray-100 mb-2">
              {user.displayName}
            </h2>
          )}

          {/* Email do Usuário */}
          <p className="text-gray-300 text-md mb-6">
            {user.email}
          </p>
        </div>

        {/* Seção Sua Jornada */}
        <section className="bg-gray-800 bg-opacity-70 p-6 md:p-8 rounded-xl shadow-2xl w-full transform transition-all hover:scale-[1.02] duration-300">
          <h2 className="text-2xl font-semibold text-gray-100 mb-6 border-b-2 border-purple-500 pb-3 flex items-center">
            <IconJornada />
            Sua Jornada
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg shadow">
              <p className="text-sm text-purple-300">Dias Consecutivos</p>
              <p className="text-2xl font-bold text-white">{jornadaData.diasConsecutivos}</p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg shadow">
              <p className="text-sm text-purple-300">Meditações no Mês</p>
              <p className="text-2xl font-bold text-white">{jornadaData.meditacoesMes}</p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg shadow">
              <p className="text-sm text-purple-300">Meditações no Ano</p>
              <p className="text-2xl font-bold text-white">{jornadaData.meditacoesAno}</p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg shadow">
              <p className="text-sm text-purple-300">Total de Meditações</p>
              <p className="text-2xl font-bold text-white">{jornadaData.meditacoesTotal}</p>
            </div>
            <div className="sm:col-span-2 bg-gray-700 bg-opacity-50 p-4 rounded-lg shadow">
              <p className="text-sm text-purple-300">Minutos Totais de Meditação</p>
              <p className="text-2xl font-bold text-white">{jornadaData.minutosTotal.toLocaleString("pt-BR")} min</p>
            </div>
          </div>
        </section>
      </main>

      {/* Popup de Seleção de Ícone */}
      {showIconPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Escolha seu Ícone</h3>
              <button onClick={() => setShowIconPopup(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {profileIcons.map((iconSrc) => (
                <button
                  key={iconSrc}
                  onClick={() => handleIconSelect(iconSrc)}
                  className={`p-2 rounded-lg hover:bg-purple-700 transition-colors ${selectedIcon === iconSrc ? "bg-purple-600 ring-2 ring-purple-400" : "bg-gray-700"}`}
                  aria-label={`Selecionar ícone ${iconSrc.split("/").pop()?.split(".")[0].replace("icon_", "").replace("_", " ")}`}
                >
                  <Image src={iconSrc} alt={`Ícone ${iconSrc}`} width={64} height={64} className="rounded-full mx-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Navbar />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}

