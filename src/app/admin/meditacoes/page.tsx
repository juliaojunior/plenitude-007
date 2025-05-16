// src/app/admin/meditacoes/page.tsx
"use client";

import { useState, useEffect } from "react";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

// Interface para uma Meditação
interface MeditacaoEntry {
  id?: string; // ID do documento no Firestore
  titulo: string;
  categoria: string; // Ex: "Ansiedade", "Gratidão", "Foco", "Paz", "Sono", "Sabedoria"
  urlAudio: string;
  texto: string; // Transcrição ou texto de apoio
  createdAt?: Timestamp;
}

const CATEGORIAS_MEDITACAO = [
  "Ansiedade",
  "Gratidão",
  "Foco",
  "Paz",
  "Sono",
  "Sabedoria",
];

export default function AdminMeditacoesPage() {
  const [meditacoes, setMeditacoes] = useState<MeditacaoEntry[]>([]);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS_MEDITACAO[0]);
  const [urlAudio, setUrlAudio] = useState("");
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<MeditacaoEntry | null>(null);

  const meditacoesCollectionRef = collection(db, "meditacoes");

  const fetchMeditacoes = async () => {
    setLoading(true);
    try {
      const q = query(meditacoesCollectionRef, orderBy("categoria"), orderBy("titulo"));
      const querySnapshot = await getDocs(q);
      const entriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<MeditacaoEntry, "id">),
      }));
      setMeditacoes(entriesData);
    } catch (err) {
      console.error("Erro ao buscar Meditações: ", err);
      setError("Falha ao carregar as meditações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (db) {
        fetchMeditacoes();
    }
  }, [db]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!titulo || !categoria || !urlAudio || !texto) {
      setError("Todos os campos são obrigatórios.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const newMeditacao: Omit<MeditacaoEntry, "id" | "createdAt"> & { createdAt: Timestamp } = {
      titulo,
      categoria,
      urlAudio,
      texto,
      createdAt: Timestamp.now(),
    };

    try {
      if (editingEntry && editingEntry.id) {
        const entryDocRef = doc(db, "meditacoes", editingEntry.id);
        await updateDoc(entryDocRef, {
            titulo,
            categoria,
            urlAudio,
            texto,
        });
        setSuccessMessage("Meditação atualizada com sucesso!");
      } else {
        await addDoc(meditacoesCollectionRef, newMeditacao);
        setSuccessMessage("Nova meditação adicionada com sucesso!");
      }
      setTitulo("");
      setCategoria(CATEGORIAS_MEDITACAO[0]);
      setUrlAudio("");
      setTexto("");
      setEditingEntry(null);
      fetchMeditacoes();
    } catch (err) {
      console.error("Erro ao salvar Meditação: ", err);
      setError("Falha ao salvar a meditação.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta meditação?")) return;
    setLoading(true);
    try {
      const entryDocRef = doc(db, "meditacoes", id);
      await deleteDoc(entryDocRef);
      setSuccessMessage("Meditação excluída com sucesso!");
      fetchMeditacoes();
    } catch (err) {
      console.error("Erro ao deletar Meditação: ", err);
      setError("Falha ao excluir a meditação.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry: MeditacaoEntry) => {
    setEditingEntry(entry);
    setTitulo(entry.titulo);
    setCategoria(entry.categoria);
    setUrlAudio(entry.urlAudio);
    setTexto(entry.texto);
    setError(null);
    setSuccessMessage(null);
    window.scrollTo(0, 0);
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Gerenciar Meditações
          </h1>
        </header>

        <section className="bg-gray-800 p-6 rounded-lg shadow-xl mb-10">
          <h2 className="text-2xl font-semibold text-gray-300 mb-6">
            {editingEntry ? "Editar Meditação" : "Adicionar Nova Meditação"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-300 mb-1">Título</label>
              <input
                type="text"
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Título da Meditação"
              />
            </div>
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-300 mb-1">Categoria</label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
              >
                {CATEGORIAS_MEDITACAO.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="urlAudio" className="block text-sm font-medium text-gray-300 mb-1">URL do Áudio</label>
              <input
                type="url"
                id="urlAudio"
                value={urlAudio}
                onChange={(e) => setUrlAudio(e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                placeholder="https://exemplo.com/audio.mp3"
              />
            </div>
            <div>
              <label htmlFor="texto" className="block text-sm font-medium text-gray-300 mb-1">Texto/Transcrição</label>
              <textarea
                id="texto"
                rows={8}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Digite a transcrição ou texto de apoio da meditação..."
              />
            </div>
            
            {error && <p className="text-sm text-red-400 text-center py-2 bg-red-900 bg-opacity-50 rounded-md">{error}</p>}
            {successMessage && <p className="text-sm text-green-300 text-center py-2 bg-green-900 bg-opacity-50 rounded-md">{successMessage}</p>}

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex-grow justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-60 transition-colors"
                >
                {loading ? (editingEntry ? "Atualizando..." : "Adicionando...") : (editingEntry ? "Atualizar Meditação" : "Adicionar Meditação")}
                </button>
                {editingEntry && (
                    <button
                    type="button"
                    onClick={() => { setEditingEntry(null); setTitulo(""); setCategoria(CATEGORIAS_MEDITACAO[0]); setUrlAudio(""); setTexto(""); setError(null); setSuccessMessage(null); }}
                    className="w-full sm:w-auto justify-center py-3 px-6 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                    Cancelar Edição
                    </button>
                )}
            </div>
          </form>
        </section>

        <section className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-300 mb-6">Meditações Existentes</h2>
          {loading && meditacoes.length === 0 && <p className="text-gray-400">Carregando meditações...</p>}
          {!loading && meditacoes.length === 0 && <p className="text-gray-400">Nenhuma meditação encontrada.</p>}
          {meditacoes.length > 0 && (
            <div className="space-y-4">
              {meditacoes.map((entry) => (
                <div key={entry.id} className="bg-gray-700 p-4 rounded-md shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <p className="text-lg font-semibold text-purple-400">{entry.titulo}</p>
                    <p className="text-sm text-gray-300">Categoria: {entry.categoria}</p>
                    <p className="text-sm text-gray-400 mt-1 truncate-2-lines">Áudio: {entry.urlAudio}</p>
                    <p className="text-sm text-gray-400 mt-1 truncate-3-lines">Texto: {entry.texto}</p>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
                    <button 
                        onClick={() => handleEdit(entry)}
                        className="py-1 px-3 text-sm bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
                    >
                        Editar
                    </button>
                    <button 
                        onClick={() => entry.id && handleDelete(entry.id)}
                        disabled={loading}
                        className="py-1 px-3 text-sm bg-red-600 hover:bg-red-700 rounded-md text-white disabled:opacity-60 transition-colors"
                    >
                        Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-12 text-center">
          <Link href="/admin/dashboard" className="text-blue-400 hover:text-blue-300 hover:underline">
            Voltar para o Dashboard
          </Link>
        </footer>
      </div>
    </AdminProtectedRoute>
  );
}

