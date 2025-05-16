// src/app/cadastro/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase"; // Ajuste o caminho se necessário
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import Image from "next/image";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCadastro = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (senha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (!auth) {
      setError("Erro na configuração da autenticação. Tente novamente mais tarde.");
      console.error("Objeto auth do Firebase está nulo.");
      setLoading(false); // Certifique-se de parar o loading se houver erro aqui
      return;
    }

    setLoading(true);

    try {
      // Cria o usuário com email e senha
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );
      const user = userCredential.user;

      // Atualiza o perfil do usuário com o nome
      if (user) {
        await updateProfile(user, {
          displayName: nome,
        });
      }

      // Cadastro bem-sucedido, redireciona para a página de login
      alert("Cadastro realizado com sucesso! Você será redirecionado para o login.");
      router.push("/login");
    } catch (error: unknown) {
      // Trata erros de cadastro
      console.error("Erro ao cadastrar:", error);

    let errorCode: string | undefined = undefined;
      if (typeof error === "object" && error !== null && "code" in error) {
        errorCode = (error as { code: string }).code;
      }

      if (errorCode === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso.");
      } else if (errorCode === "auth/invalid-email") {
        setError("Formato de e-mail inválido.");
      } else if (errorCode === "auth/weak-password") {
        setError("A senha é muito fraca. Tente uma senha mais forte.");
      } else {
        setError("Ocorreu um erro ao realizar o cadastro. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-2xl rounded-lg p-8 max-w-md w-full">
        {/* Símbolo do PWA no topo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/icons/icon-192x192.png" // Caminho para o ícone do PWA
            alt="Plenitude PWA Logo"
            width={80}
            height={80}
            className="rounded-full"
          />
        </div>

        <h1 className="text-3xl font-bold text-center text-white mb-8">
          Criar Conta
        </h1>

        <form onSubmit={handleCadastro} className="space-y-6">
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-gray-300"
            >
              Nome Completo
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              autoComplete="name"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Endereço de E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
              placeholder="voce@exemplo.com"
            />
          </div>

          <div>
            <label
              htmlFor="senha"
              className="block text-sm font-medium text-gray-300"
            >
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              autoComplete="new-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Já tem uma conta?{' '}
          <a
            href="/login"
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            Faça login
          </a>
        </p>
      </div>
    </div>
  );
}
