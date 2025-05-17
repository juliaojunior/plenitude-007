"use client";
import ProtectedRoute from "@/components/ProtectedRoute"; // Componente para proteger a rota
import Navbar from "@/components/Navbar"; // Componente da barra de navegação
import { useAuth } from "@/contexts/AuthContext"; // Hook para acessar informações do usuário
import Image from "next/image"; // Componente para otimização de imagens
import { useState, useEffect, ReactNode } from "react";
import { Edit3, X, Bell, Settings } from "lucide-react"; // Ícones para edição, fechar popup, notificações e configurações
import Link from "next/link"; // Componente para navegação entre páginas
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Interface para os dados da jornada do usuário
interface JornadaData {
  diasConsecutivos: number;
  meditacoesMes: number;
  meditacoesAno: number;
  totalMeditacoes: number;
  minutosMeditados: number;
}

// Interface para as conquistas
interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  icone: ReactNode;
  criterio: (jornada: JornadaData) => boolean;
  nivel: string;
}

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
  const { user, updateUserProfile } = useAuth(); // Obtém o usuário logado do contexto de autenticação
  const [showIconPopup, setShowIconPopup] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("/user-placeholder.svg"); // Ícone padrão
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [jornada, setJornada] = useState<JornadaData>({
    diasConsecutivos: 0,
    meditacoesMes: 0,
    meditacoesAno: 0,
    totalMeditacoes: 0,
    minutosMeditados: 0
  });
  const [carregandoJornada, setCarregandoJornada] = useState(true);
  const [conquistasDesbloqueadas, setConquistasDesbloqueadas] = useState<Conquista[]>([]);
  const [proximasConquistas, setProximasConquistas] = useState<Conquista[]>([]);
  const [conquistaSelecionada, setConquistaSelecionada] = useState<Conquista | null>(null);

  // Efeito para carregar o ícone salvo do localStorage ao montar o componente
  useEffect(() => {
    const savedIcon = localStorage.getItem("userProfileIcon");
    if (savedIcon && profileIcons.includes(savedIcon)) {
      setSelectedIcon(savedIcon);
    }
    
    if (user) {
      setNewName(user.displayName || "");
      carregarDadosJornada();
    }
  }, [user]);

  // Função para lidar com a seleção de um novo ícone
  const handleIconSelect = (iconPath: string) => {
    setSelectedIcon(iconPath);
    localStorage.setItem("userProfileIcon", iconPath); // Salva no localStorage
    setShowIconPopup(false); // Fecha o popup
  };

  // Função para iniciar a edição do nome
  const handleStartEditName = () => {
    setIsEditingName(true);
    setNewName(user?.displayName || "");
    setSaveError("");
    setSaveSuccess(false);
  };

  // Função para cancelar a edição do nome
  const handleCancelEditName = () => {
    setIsEditingName(false);
    setSaveError("");
  };

  // Função para salvar o novo nome
  const handleSaveName = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    
    try {
      // Atualiza o nome no Firebase Authentication
      await updateUserProfile({ displayName: newName });
      
      // Atualiza ou cria o documento do usuário no Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        // Se o documento existe, atualiza o displayName
        await updateDoc(userDocRef, {
          displayName: newName
        });
      } else {
        // Se o documento não existe, cria um novo
        await setDoc(userDocRef, {
          displayName: newName,
          email: user.email,
          role: "user",
          createdAt: new Date().toISOString()
        });
      }
      
      setIsEditingName(false);
      setSaveSuccess(true);
      
      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error("Erro ao atualizar nome:", error);
      setSaveError("Não foi possível atualizar o nome. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // Função para carregar os dados da jornada do usuário
  const carregarDadosJornada = async () => {
    if (!user) return;
    
    setCarregandoJornada(true);
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists() && userDocSnap.data().jornada) {
        // Se já existem dados de jornada, usa eles
        setJornada(userDocSnap.data().jornada);
      } else {
        // Se não existem, calcula com base no histórico ou usa valores padrão
        // Aqui você pode implementar a lógica para calcular com base no histórico
        // Por enquanto, usamos valores padrão
        const jornadaPadrao = {
          diasConsecutivos: 0,
          meditacoesMes: 0,
          meditacoesAno: 0,
          totalMeditacoes: 0,
          minutosMeditados: 0
        };
        
        setJornada(jornadaPadrao);
        
        // Opcionalmente, salva esses valores padrão no Firestore
        if (userDocSnap.exists()) {
          await updateDoc(userDocRef, {
            jornada: jornadaPadrao
          });
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados da jornada:", error);
    } finally {
      setCarregandoJornada(false);
      calcularConquistas();
    }
  };

  // Lista de conquistas disponíveis
  const todasConquistas: Conquista[] = [
    // Nível Bronze (Iniciante)
    {
      id: "primeira-meditacao",
      titulo: "Primeiro Passo",
      descricao: "Completou sua primeira meditação",
      icone: <span className="text-2xl">🌱</span>,
      criterio: (j) => j.totalMeditacoes >= 1,
      nivel: "bronze"
    },
    {
      id: "tres-dias",
      titulo: "Consistência Inicial",
      descricao: "Meditou por 3 dias consecutivos",
      icone: <span className="text-2xl">📆</span>,
      criterio: (j) => j.diasConsecutivos >= 3,
      nivel: "bronze"
    },
    {
      id: "dez-meditacoes",
      titulo: "Dedicação Crescente",
      descricao: "Completou 10 meditações",
      icone: <span className="text-2xl">🔟</span>,
      criterio: (j) => j.totalMeditacoes >= 10,
      nivel: "bronze"
    },
    {
      id: "hora-meditada",
      titulo: "Uma Hora de Paz",
      descricao: "Acumulou 60 minutos de meditação",
      icone: <span className="text-2xl">⏱️</span>,
      criterio: (j) => j.minutosMeditados >= 60,
      nivel: "bronze"
    },
    
    // Nível Prata (Intermediário)
    {
      id: "sete-dias",
      titulo: "Uma Semana Zen",
      descricao: "Meditou por 7 dias consecutivos",
      icone: <span className="text-2xl">🗓️</span>,
      criterio: (j) => j.diasConsecutivos >= 7,
      nivel: "prata"
    },
    {
      id: "trinta-meditacoes",
      titulo: "Praticante Regular",
      descricao: "Completou 30 meditações",
      icone: <span className="text-2xl">🧘</span>,
      criterio: (j) => j.totalMeditacoes >= 30,
      nivel: "prata"
    },
    {
      id: "cinco-horas",
      titulo: "Imersão Profunda",
      descricao: "Acumulou 5 horas de meditação",
      icone: <span className="text-2xl">🕔</span>,
      criterio: (j) => j.minutosMeditados >= 300,
      nivel: "prata"
    },
    
    // Nível Ouro (Avançado)
    {
      id: "trinta-dias",
      titulo: "Mestre da Constância",
      descricao: "Meditou por 30 dias consecutivos",
      icone: <span className="text-2xl">🏆</span>,
      criterio: (j) => j.diasConsecutivos >= 30,
      nivel: "ouro"
    },
    {
      id: "cem-meditacoes",
      titulo: "Centenário da Paz",
      descricao: "Completou 100 meditações",
      icone: <span className="text-2xl">💯</span>,
      criterio: (j) => j.totalMeditacoes >= 100,
      nivel: "ouro"
    },
    {
      id: "vinte-horas",
      titulo: "Iluminação Interior",
      descricao: "Acumulou 20 horas de meditação",
      icone: <span className="text-2xl">✨</span>,
      criterio: (j) => j.minutosMeditados >= 1200,
      nivel: "ouro"
    }
  ];

  // Função para calcular conquistas desbloqueadas e próximas
  const calcularConquistas = () => {
    const desbloqueadas = todasConquistas.filter(conquista => 
      conquista.criterio(jornada)
    );
    
    const proximas = todasConquistas.filter(conquista => 
      !conquista.criterio(jornada)
    ).slice(0, 3); // Limita a 3 próximas conquistas
    
    setConquistasDesbloqueadas(desbloqueadas);
    setProximasConquistas(proximas);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Cabeçalho do Perfil */}
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
          Meu Perfil
        </h1>

        {/* Seção de Informações do Usuário */}
        <div className="bg-gray-800 bg-opacity-70 rounded-xl p-6 md:p-8 shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            {/* Foto/Ícone de Perfil */}
            <div className="relative mb-6 md:mb-0 md:mr-8">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 border-4 border-purple-500 relative">
                <Image
                  src={selectedIcon}
                  alt="Ícone de perfil"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
              <button
                onClick={() => setShowIconPopup(true)}
                className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full text-white hover:bg-purple-700 transition-colors"
                aria-label="Editar foto de perfil"
              >
                <Edit3 size={18} />
              </button>
            </div>

            {/* Informações do Usuário */}
            <div className="flex-1 text-center md:text-left">
              {/* Nome do Usuário */}
              <div className="mb-4">
                {isEditingName ? (
                  <div className="flex flex-col space-y-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Seu nome"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveName}
                        disabled={isSaving}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        {isSaving ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        onClick={handleCancelEditName}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                    {saveError && (
                      <p className="text-red-400 text-sm mt-1">{saveError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center md:justify-start">
                    <h2 className="text-2xl font-semibold text-white mr-2">
                      {user?.displayName || "Usuário"}
                    </h2>
                    <button
                      onClick={handleStartEditName}
                      className="text-gray-400 hover:text-purple-400 transition-colors"
                      aria-label="Editar nome"
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>
                )}
                {saveSuccess && (
                  <p className="text-green-400 text-sm mt-1">Nome atualizado com sucesso!</p>
                )}
              </div>

              {/* Email do Usuário */}
              <p className="text-gray-300 mb-4">{user?.email}</p>

              {/* Link para Configurações de Notificação */}
              <Link 
                href="/configuracoes/notificacoes" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
              >
                <Bell size={16} className="mr-2" />
                Configurações de Notificação
              </Link>
            </div>
          </div>
        </div>

        {/* Seção de Jornada */}
        <div className="bg-gray-800 bg-opacity-70 rounded-xl p-6 md:p-8 shadow-2xl mb-8">
          <div className="flex items-center mb-4">
            <IconJornada />
            <h2 className="text-2xl font-semibold text-white">Sua Jornada</h2>
          </div>

          {carregandoJornada ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-400"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg text-center">
                <p className="text-gray-300 text-sm">Dias Consecutivos</p>
                <p className="text-3xl font-bold text-purple-400">{jornada.diasConsecutivos}</p>
              </div>
              <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg text-center">
                <p className="text-gray-300 text-sm">Meditações este Mês</p>
                <p className="text-3xl font-bold text-purple-400">{jornada.meditacoesMes}</p>
              </div>
              <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg text-center">
                <p className="text-gray-300 text-sm">Meditações este Ano</p>
                <p className="text-3xl font-bold text-purple-400">{jornada.meditacoesAno}</p>
              </div>
              <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg text-center">
                <p className="text-gray-300 text-sm">Total de Meditações</p>
                <p className="text-3xl font-bold text-purple-400">{jornada.totalMeditacoes}</p>
              </div>
              <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg text-center col-span-1 md:col-span-2">
                <p className="text-gray-300 text-sm">Minutos Meditados</p>
                <p className="text-3xl font-bold text-purple-400">{jornada.minutosMeditados}</p>
              </div>
            </div>
          )}
        </div>

        {/* Seção de Conquistas */}
        <div className="bg-gray-800 bg-opacity-70 rounded-xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Conquistas e Medalhas</h2>
          
          {/* Conquistas Desbloqueadas */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-purple-300 mb-4">Conquistas Desbloqueadas</h3>
            
            {conquistasDesbloqueadas.length === 0 ? (
              <p className="text-gray-400 italic">Continue meditando para desbloquear conquistas!</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {conquistasDesbloqueadas.map((conquista) => (
                  <button
                    key={conquista.id}
                    onClick={() => setConquistaSelecionada(conquista)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-transform transform hover:scale-105 ${
                      conquista.nivel === "bronze" 
                        ? "bg-amber-700 bg-opacity-40" 
                        : conquista.nivel === "prata" 
                        ? "bg-gray-500 bg-opacity-40" 
                        : "bg-yellow-600 bg-opacity-40"
                    }`}
                  >
                    <div className="text-3xl mb-2">{conquista.icone}</div>
                    <p className="text-xs text-center font-medium">{conquista.titulo}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Próximas Conquistas */}
          <div>
            <h3 className="text-lg font-medium text-blue-300 mb-4">Próximas Conquistas</h3>
            
            {proximasConquistas.length === 0 ? (
              <p className="text-gray-400 italic">Parabéns! Você desbloqueou todas as conquistas disponíveis.</p>
            ) : (
              <div className="space-y-3">
                {proximasConquistas.map((conquista) => (
                  <div key={conquista.id} className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className="mr-3 opacity-50">{conquista.icone}</div>
                      <div>
                        <h4 className="font-medium text-gray-200">{conquista.titulo}</h4>
                        <p className="text-sm text-gray-400">{conquista.descricao}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Popup de Seleção de Ícone */}
      {showIconPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Escolha um ícone</h3>
              <button
                onClick={() => setShowIconPopup(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Fechar"
              >
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {profileIcons.map((icon, index) => (
                <button
                  key={index}
                  onClick={() => handleIconSelect(icon)}
                  className={`p-2 rounded-lg hover:bg-gray-700 transition-colors ${
                    selectedIcon === icon ? "ring-2 ring-purple-500 bg-gray-700" : ""
                  }`}
                >
                  <Image
                    src={icon}
                    alt={`Ícone de perfil ${index + 1}`}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Popup de Detalhes da Conquista */}
      {conquistaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">{conquistaSelecionada.titulo}</h3>
              <button
                onClick={() => setConquistaSelecionada(null)}
                className="text-gray-400 hover:text-white"
                aria-label="Fechar"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col items-center mb-4">
              <div className="text-5xl mb-4">{conquistaSelecionada.icone}</div>
              <p className="text-center text-gray-300">{conquistaSelecionada.descricao}</p>
              <div className={`mt-4 px-4 py-1 rounded-full text-xs font-medium ${
                conquistaSelecionada.nivel === "bronze" 
                  ? "bg-amber-700 text-amber-100" 
                  : conquistaSelecionada.nivel === "prata" 
                  ? "bg-gray-500 text-gray-100" 
                  : "bg-yellow-600 text-yellow-100"
              }`}>
                Nível {conquistaSelecionada.nivel === "bronze" ? "Bronze" : conquistaSelecionada.nivel === "prata" ? "Prata" : "Ouro"}
              </div>
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
