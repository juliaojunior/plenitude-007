// src/app/admin/mana-diario/page.tsx
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

// Interface para uma entrada do Maná Diário
interface ManaEntry {
  id?: string; // ID do documento no Firestore (opcional na criação)
  data: string; // Data no formato YYYY-MM-DD
  textoBiblico: string;
  comentario: string;
  createdAt?: Timestamp; // Timestamp de quando foi criado
}

export default function AdminManaDiarioPage() {
  const [entradas, setEntradas] = useState<ManaEntry[]>([]);
  const [data, setData] = useState("");
  const [textoBiblico, setTextoBiblico] = useState("");
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<ManaEntry | null>(null);

  // Coleção do Maná Diário no Firestore
  const manaCollectionRef = collection(db, "mana_diario");

  // Função para buscar todas as entradas do Maná Diário
  const fetchManaEntries = async () => {
    setLoading(true);
    try {
      const q = query(manaCollectionRef, orderBy("data", "desc")); // Ordena pela data mais recente
      const querySnapshot = await getDocs(q);
      const entriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ManaEntry, "id">),
      }));
      setEntradas(entriesData);
    } catch (err) {
      console.error("Erro ao buscar Maná Diário: ", err);
      setError("Falha ao carregar as entradas do Maná Diário.");
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar as entradas ao carregar a página
  useEffect(() => {
    if (db) { // Garante que o db está inicializado
        fetchManaEntries();
    }
  }, [db]);

  // Limpar mensagens após um tempo
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  // Função para lidar com o envio do formulário (adicionar ou editar)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data || !textoBiblico || !comentario) {
      setError("Todos os campos são obrigatórios.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const newEntry: Omit<ManaEntry, "id" | "createdAt"> & { createdAt: Timestamp } = {
      data,
      textoBiblico,
      comentario,
      createdAt: Timestamp.now(),
    };

    try {
      if (editingEntry && editingEntry.id) {
        // Atualizar entrada existente
        const entryDocRef = doc(db, "mana_diario", editingEntry.id);
        await updateDoc(entryDocRef, {
            data,
            textoBiblico,
            comentario,
            // Não atualizamos o createdAt intencionalmente
        });
        setSuccessMessage("Entrada do Maná Diário atualizada com sucesso!");
      } else {
        // Adicionar nova entrada
        await addDoc(manaCollectionRef, newEntry);
        setSuccessMessage("Nova entrada do Maná Diário adicionada com sucesso!");
      }
      // Limpar formulário e recarregar entradas
      setData("");
      setTextoBiblico("");
      setComentario("");
      setEditingEntry(null);
      fetchManaEntries(); // Recarrega a lista
    } catch (err) {
      console.error("Erro ao salvar Maná Diário: ", err);
      setError("Falha ao salvar a entrada do Maná Diário.");
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar uma entrada
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta entrada?")) return;
    setLoading(true);
    try {
      const entryDocRef = doc(db, "mana_diario", id);
      await deleteDoc(entryDocRef);
      setSuccessMessage("Entrada excluída com sucesso!");
      fetchManaEntries(); // Recarrega a lista
    } catch (err) {
      console.error("Erro ao deletar Maná Diário: ", err);
      setError("Falha ao excluir a entrada.");
    } finally {
      setLoading(false);
    }
  };

  // Função para popular o formulário para edição
  const handleEdit = (entry: ManaEntry) => {
    setEditingEntry(entry);
    setData(entry.data);
    setTextoBiblico(entry.textoBiblico);
    setComentario(entry.comentario);
    setError(null);
    setSuccessMessage(null);
    window.scrollTo(0, 0); // Rola para o topo para ver o formulário
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">
            Gerenciar Maná Diário
          </h1>
        </header>

        {/* Formulário para Adicionar/Editar Maná Diário */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-xl mb-10">
          <h2 className="text-2xl font-semibold text-gray-300 mb-6">
            {editingEntry ? "Editar Entrada" : "Adicionar Nova Entrada"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="data" className="block text-sm font-medium text-gray-300 mb-1">Data</label>
              <input
                type="date"
                id="data"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="textoBiblico" className="block text-sm font-medium text-gray-300 mb-1">Texto Bíblico</label>
              <textarea
                id="textoBiblico"
                rows={4}
                value={textoBiblico}
                onChange={(e) => setTextoBiblico(e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500"
                placeholder="Ex: João 3:16"
              />
            </div>
            <div>
              <label htmlFor="comentario" className="block text-sm font-medium text-gray-300 mb-1">Comentário/Reflexão</label>
              <textarea
                id="comentario"
                rows={6}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500"
                placeholder="Sua reflexão sobre o texto..."
              />
            </div>
            
            {error && <p className="text-sm text-red-400 text-center py-2 bg-red-900 bg-opacity-50 rounded-md">{error}</p>}
            {successMessage && <p className="text-sm text-green-300 text-center py-2 bg-green-900 bg-opacity-50 rounded-md">{successMessage}</p>}

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex-grow justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 transition-colors"
                >
                {loading ? (editingEntry ? "Atualizando..." : "Adicionando...") : (editingEntry ? "Atualizar Entrada" : "Adicionar Entrada")}
                </button>
                {editingEntry && (
                    <button
                    type="button"
                    onClick={() => { setEditingEntry(null); setData(''); setTextoBiblico(''); setComentario(''); setError(null); setSuccessMessage(null); }}
                    className="w-full sm:w-auto justify-center py-3 px-6 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                    Cancelar Edição
                    </button>
                )}
            </div>
          </form>
        </section>

        {/* Lista de Entradas do Maná Diário */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-300 mb-6">Entradas Existentes</h2>
          {loading && entradas.length === 0 && <p className="text-gray-400">Carregando entradas...</p>}
          {!loading && entradas.length === 0 && <p className="text-gray-400">Nenhuma entrada do Maná Diário encontrada.</p>}
          {entradas.length > 0 && (
            <div className="space-y-4">
              {entradas.map((entry) => (
                <div key={entry.id} className="bg-gray-700 p-4 rounded-md shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <p className="text-lg font-semibold text-green-400">{new Date(entry.data + 'T00:00:00-03:00').toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm text-gray-300 mt-1 truncate-3-lines"><strong>Texto:</strong> {entry.textoBiblico}</p>
                    <p className="text-sm text-gray-400 mt-1 truncate-3-lines"><strong>Comentário:</strong> {entry.comentario}</p>
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

