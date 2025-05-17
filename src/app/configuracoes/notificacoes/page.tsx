"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Bell, Clock, Calendar, Plus, X, Save, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

// Interface para as configurações de notificação
interface NotificacaoConfig {
  ativo: boolean;
  horarios: string[];
  diasSemana: number[];
  tiposLembrete: {
    praticaDiaria: boolean;
    novasMediacoes: boolean;
    manterSequencia: boolean;
    sugestoes: boolean;
  };
  antecedencia: number;
  ultimaNotificacao?: string;
}

// Interface para o componente TimeSelector
interface TimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  showRemove?: boolean;
}

// Configurações padrão
const configPadrao: NotificacaoConfig = {
  ativo: true,
  horarios: ["07:00", "19:30"],
  diasSemana: [0, 1, 2, 3, 4, 5, 6], // Todos os dias da semana
  tiposLembrete: {
    praticaDiaria: true,
    novasMediacoes: true,
    manterSequencia: true,
    sugestoes: false,
  },
  antecedencia: 15,
  ultimaNotificacao: "",
};

// Nomes dos dias da semana
const diasSemanaLabels = ["D", "S", "T", "Q", "Q", "S", "S"];

// Componente para seleção de horário
const TimeSelector = ({ value, onChange, onRemove, showRemove = true }: TimeSelectorProps) => {
  return (
    <div className="flex items-center mb-2">
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      {showRemove && (
        <button
          onClick={onRemove}
          className="ml-2 p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Remover horário"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

// Componente principal da página de configurações de notificação
function NotificacoesPageContent() {
  const { user } = useAuth();
  const [config, setConfig] = useState<NotificacaoConfig>(configPadrao);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [novoHorario, setNovoHorario] = useState("08:00");
  const [showAddHorario, setShowAddHorario] = useState(false);

  // Carregar configurações do usuário
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().notificacoes) {
          // Se já existem configurações, usa elas
          setConfig(userDocSnap.data().notificacoes);
        } else {
          // Se não existem, usa as configurações padrão
          setConfig(configPadrao);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        // Em caso de erro, mantém as configurações padrão
      } finally {
        setLoading(false);
      }
    };

    carregarConfiguracoes();
  }, [user]);

  // Salvar configurações
  const salvarConfiguracoes = async () => {
    if (!user) return;

    setSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // Se o documento existe, atualiza as configurações
        await updateDoc(userDocRef, {
          notificacoes: config,
        });
      } else {
        // Se o documento não existe, cria um novo
        await setDoc(userDocRef, {
          displayName: user.displayName || "",
          email: user.email,
          role: "user",
          createdAt: new Date().toISOString(),
          notificacoes: config,
        });
      }

      setSaveSuccess(true);
      
      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      setSaveError("Não foi possível salvar as configurações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // Manipuladores de alteração
  const toggleAtivo = () => {
    setConfig({ ...config, ativo: !config.ativo });
  };

  const toggleDiaSemana = (dia: number) => {
    const novosDias = [...config.diasSemana];
    if (novosDias.includes(dia)) {
      // Remove o dia se já estiver selecionado
      setConfig({
        ...config,
        diasSemana: novosDias.filter((d) => d !== dia),
      });
    } else {
      // Adiciona o dia se não estiver selecionado
      setConfig({
        ...config,
        diasSemana: [...novosDias, dia].sort(),
      });
    }
  };

  const toggleTipoLembrete = (tipo: keyof typeof config.tiposLembrete) => {
    setConfig({
      ...config,
      tiposLembrete: {
        ...config.tiposLembrete,
        [tipo]: !config.tiposLembrete[tipo],
      },
    });
  };

  const atualizarHorario = (index: number, valor: string) => {
    const novosHorarios = [...config.horarios];
    novosHorarios[index] = valor;
    setConfig({ ...config, horarios: novosHorarios });
  };

  const removerHorario = (index: number) => {
    const novosHorarios = [...config.horarios];
    novosHorarios.splice(index, 1);
    setConfig({ ...config, horarios: novosHorarios });
  };

  const adicionarHorario = () => {
    if (novoHorario && !config.horarios.includes(novoHorario)) {
      setConfig({
        ...config,
        horarios: [...config.horarios, novoHorario].sort(),
      });
      setNovoHorario("08:00");
      setShowAddHorario(false);
    }
  };

  const atualizarAntecedencia = (valor: string) => {
    const numero = parseInt(valor);
    if (!isNaN(numero) && numero >= 0) {
      setConfig({ ...config, antecedencia: numero });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Cabeçalho */}
        <div className="mb-8">
          <Link
            href="/perfil"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Voltar para o Perfil
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            Configurações de Notificação
          </h1>
          <p className="text-gray-300">
            Personalize como e quando deseja receber lembretes para suas práticas de meditação.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-400"></div>
            <span className="ml-3 text-gray-300">Carregando configurações...</span>
          </div>
        ) : (
          <div className="bg-gray-800 bg-opacity-70 p-6 md:p-8 rounded-xl shadow-2xl space-y-8">
            {/* Ativação Geral */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-6 w-6 mr-3 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Ativar Notificações</h2>
              </div>
              <button
                onClick={toggleAtivo}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  config.ativo ? "bg-purple-600" : "bg-gray-600"
                }`}
                aria-checked={config.ativo}
                role="switch"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    config.ativo ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Nota sobre PWA */}
            <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg flex items-start">
              <Info className="h-5 w-5 mr-2 text-blue-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-200">
                As notificações funcionam melhor quando o aplicativo é instalado como PWA. 
                Você precisará conceder permissão de notificação quando solicitado pelo navegador.
              </p>
            </div>

            {/* Seções de Configuração - Desativadas se notificações estiverem desligadas */}
            <div className={config.ativo ? "" : "opacity-50 pointer-events-none"}>
              {/* Horários de Lembretes */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Clock className="h-6 w-6 mr-2 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">Horários de Lembretes</h2>
                </div>
                
                <div className="pl-8 space-y-2">
                  {config.horarios.map((horario, index) => (
                    <TimeSelector
                      key={index}
                      value={horario}
                      onChange={(valor) => atualizarHorario(index, valor)}
                      onRemove={() => removerHorario(index)}
                      showRemove={config.horarios.length > 1}
                    />
                  ))}
                  
                  {showAddHorario ? (
                    <div className="flex items-center mt-3">
                      <TimeSelector
                        value={novoHorario}
                        onChange={setNovoHorario}
                        onRemove={() => setShowAddHorario(false)}
                      />
                      <button
                        onClick={adicionarHorario}
                        className="ml-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddHorario(true)}
                      className="flex items-center mt-3 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors"
                    >
                      <Plus size={16} className="mr-1" />
                      Adicionar Horário
                    </button>
                  )}
                </div>
              </div>

              {/* Dias da Semana */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Calendar className="h-6 w-6 mr-2 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">Dias da Semana</h2>
                </div>
                
                <div className="pl-8 flex flex-wrap gap-2">
                  {diasSemanaLabels.map((label, index) => (
                    <button
                      key={index}
                      onClick={() => toggleDiaSemana(index)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                        config.diasSemana.includes(index)
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                      aria-label={`Dia ${label}`}
                      aria-pressed={config.diasSemana.includes(index)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipos de Lembretes */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Tipos de Lembretes</h2>
                
                <div className="space-y-3 pl-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="praticaDiaria"
                      checked={config.tiposLembrete.praticaDiaria}
                      onChange={() => toggleTipoLembrete("praticaDiaria")}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="praticaDiaria" className="ml-2 text-gray-300">
                      Lembrete para prática diária
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="novasMediacoes"
                      checked={config.tiposLembrete.novasMediacoes}
                      onChange={() => toggleTipoLembrete("novasMediacoes")}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="novasMediacoes" className="ml-2 text-gray-300">
                      Notificação de novas meditações
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="manterSequencia"
                      checked={config.tiposLembrete.manterSequencia}
                      onChange={() => toggleTipoLembrete("manterSequencia")}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="manterSequencia" className="ml-2 text-gray-300">
                      Lembrete para manter sequência de dias
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sugestoes"
                      checked={config.tiposLembrete.sugestoes}
                      onChange={() => toggleTipoLembrete("sugestoes")}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="sugestoes" className="ml-2 text-gray-300">
                      Sugestões personalizadas
                    </label>
                  </div>
                </div>
              </div>

              {/* Antecedência do Lembrete */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Antecedência do Lembrete</h2>
                
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={config.antecedencia}
                    onChange={(e) => atualizarAntecedencia(e.target.value)}
                    className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
                  />
                  <span className="ml-2 text-gray-300">minutos</span>
                </div>
              </div>
            </div>

            {/* Botão de Salvar */}
            <div className="pt-4 border-t border-gray-700">
              {saveSuccess && (
                <p className="text-green-400 mb-4 bg-green-900 bg-opacity-30 p-2 rounded text-center">
                  Configurações salvas com sucesso!
                </p>
              )}
              
              {saveError && (
                <p className="text-red-400 mb-4 bg-red-900 bg-opacity-30 p-2 rounded text-center">
                  {saveError}
                </p>
              )}
              
              <button
                onClick={salvarConfiguracoes}
                disabled={saving}
                className="w-full flex items-center justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-60 transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Salvar Configurações
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
      
      <Navbar />
    </div>
  );
}

export default function NotificacoesPage() {
  return (
    <ProtectedRoute>
      <NotificacoesPageContent />
    </ProtectedRoute>
  );
}
