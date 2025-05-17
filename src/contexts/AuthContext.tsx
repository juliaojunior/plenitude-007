"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, db, googleProvider } from "@/lib/firebase"; // Importa as instâncias do Firebase
import { User, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, updateProfile } from "firebase/auth"; // Funções de autenticação do Firebase
import { doc, getDoc } from "firebase/firestore"; // Funções do Firestore para buscar documentos

// Interface para os parâmetros de atualização do perfil
interface UpdateProfileParams {
  displayName?: string;
  photoURL?: string;
}

// Define a interface para o valor do contexto de autenticação
interface AuthContextType {
  user: User | null; // Objeto do usuário do Firebase ou nulo se não estiver logado
  loading: boolean; // Indica se o estado de autenticação ainda está carregando
  isAdmin: boolean; // Indica se o usuário logado é um administrador
  userRole: string | null; // Papel do usuário (ex: "admin", "user")
  signInWithGoogle: () => Promise<void>; // Função para login com Google
  signOut: () => Promise<void>; // Função para logout
  updateUserProfile: (params: UpdateProfileParams) => Promise<void>; // Função para atualizar o perfil do usuário
}

// Cria o Contexto de Autenticação com um valor padrão undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook customizado para facilitar o uso do AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

// Props para o AuthProvider
interface AuthProviderProps {
  children: ReactNode; // Componentes filhos que terão acesso ao contexto
}

// Componente Provedor do Contexto de Autenticação
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Novo estado para isAdmin
  const [userRole, setUserRole] = useState<string | null>(null); // Novo estado para userRole

  // Efeito para observar mudanças no estado de autenticação do Firebase e buscar o papel do usuário
  useEffect(() => {
    if (!auth || !db) { // Verifica se auth e db estão disponíveis
      console.warn("Firebase auth ou db não inicializado no AuthContext.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Usuário está logado, buscar seu papel no Firestore
        try {
          const userDocRef = doc(db, "users", currentUser.uid); // Caminho para o documento do usuário
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.role === "admin") {
              setIsAdmin(true);
              setUserRole("admin");
            } else {
              setIsAdmin(false);
              setUserRole(userData.role || "user"); // Define como "user" se não houver role ou usa o role existente
            }
          } else {
            // Documento do usuário não encontrado no Firestore, assume papel padrão
            console.warn(`Documento para o usuário ${currentUser.uid} não encontrado no Firestore.`);
            setIsAdmin(false);
            setUserRole("user");
          }
        } catch (error) {
          console.error("Erro ao buscar papel do usuário no Firestore:", error);
          setIsAdmin(false);
          setUserRole("user"); // Em caso de erro, assume papel padrão
        }
      } else {
        // Usuário está deslogado
        setIsAdmin(false);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Array de dependências vazio

  // Função para realizar login com o Google
  const signInWithGoogle = async () => {
    setLoading(true);
    if (!auth) {
      console.error("Firebase auth não inicializado.");
      setLoading(false);
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged cuidará de atualizar o estado do usuário, papel e loading
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      // Mesmo em caso de erro no signIn, onAuthStateChanged pode ser disparado (ou não)
      // Se não for, o loading pode ficar true. Garantir que setLoading(false) seja chamado
      // após a lógica de verificação de papel no onAuthStateChanged ou aqui se necessário.
      // Por ora, onAuthStateChanged já tem setLoading(false)
    } 
    // setLoading(false) é chamado dentro do onAuthStateChanged
  };

  // Função para realizar logout
  const signOut = async () => {
    setLoading(true);
    if (!auth) {
      console.warn("Auth não inicializado, abortando logout.");
      setLoading(false);
      return;
    }

    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged cuidará de atualizar user para null, isAdmin para false, userRole para null e loading para false.
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setLoading(false); // Garante que o loading seja desativado em caso de erro aqui também
    }
  };

  // Função para atualizar o perfil do usuário
  const updateUserProfile = async (params: UpdateProfileParams) => {
    if (!auth.currentUser) {
      throw new Error("Nenhum usuário logado para atualizar o perfil");
    }

    try {
      await updateProfile(auth.currentUser, params);
      // Atualiza o estado local do usuário para refletir as mudanças
      // Usando o próprio objeto auth.currentUser para garantir que todas as propriedades sejam preservadas
      setUser(auth.currentUser);
      return;
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    }
  };

  // Valor fornecido pelo contexto
  const value = {
    user,
    loading,
    isAdmin,
    userRole,
    signInWithGoogle,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
