// Utilitários para gerenciar favoritos no Firestore

import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Interface para favorito
export interface Favorito {
  id: string;
  titulo: string;
  categoria: string;
  dataSalvo: string;
}

/**
 * Verifica se uma meditação está nos favoritos do usuário
 * @param userId ID do usuário
 * @param meditacaoId ID da meditação
 * @returns Boolean indicando se a meditação é favorita
 */
export async function verificarFavorito(userId: string, meditacaoId: string): Promise<boolean> {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const favoritos = userData.favoritos || [];
      return favoritos.some((fav: Favorito) => fav.id === meditacaoId);
    }
    
    return false;
  } catch (err) {
    console.error("Erro ao verificar favoritos:", err);
    return false;
  }
}

/**
 * Adiciona uma meditação aos favoritos do usuário
 * @param userId ID do usuário
 * @param meditacao Objeto com dados da meditação
 * @returns Boolean indicando sucesso da operação
 */
export async function adicionarFavorito(
  userId: string, 
  meditacao: { id: string; titulo: string; categoria: string }
): Promise<boolean> {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    const novoFavorito: Favorito = {
      id: meditacao.id,
      titulo: meditacao.titulo,
      categoria: meditacao.categoria,
      dataSalvo: new Date().toISOString()
    };
    
    if (userDocSnap.exists()) {
      // Se o documento do usuário já existe, adiciona o favorito ao array
      await updateDoc(userDocRef, {
        favoritos: arrayUnion(novoFavorito)
      });
    } else {
      // Se o documento do usuário não existe, cria um novo com o favorito
      await setDoc(userDocRef, {
        displayName: "", // Será atualizado posteriormente
        email: "", // Será atualizado posteriormente
        role: "user",
        createdAt: new Date().toISOString(),
        favoritos: [novoFavorito]
      });
    }
    
    return true;
  } catch (err) {
    console.error("Erro ao adicionar favorito:", err);
    return false;
  }
}

/**
 * Remove uma meditação dos favoritos do usuário
 * @param userId ID do usuário
 * @param meditacaoId ID da meditação
 * @returns Boolean indicando sucesso da operação
 */
export async function removerFavorito(userId: string, meditacaoId: string): Promise<boolean> {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const favoritos = userData.favoritos || [];
      
      // Filtra o favorito a ser removido
      const novosFavoritos = favoritos.filter((fav: Favorito) => fav.id !== meditacaoId);
      
      // Atualiza o documento com o novo array de favoritos
      await updateDoc(userDocRef, { favoritos: novosFavoritos });
      return true;
    }
    
    return false;
  } catch (err) {
    console.error("Erro ao remover favorito:", err);
    return false;
  }
}

/**
 * Busca todos os favoritos de um usuário
 * @param userId ID do usuário
 * @returns Array de favoritos ou array vazio em caso de erro
 */
export async function buscarFavoritos(userId: string): Promise<Favorito[]> {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return userData.favoritos || [];
    }
    
    return [];
  } catch (err) {
    console.error("Erro ao buscar favoritos:", err);
    return [];
  }
}
