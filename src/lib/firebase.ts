// Arquivo de configuração do Firebase
// Este arquivo inicializa o Firebase no seu aplicativo Next.js.
// As credenciais são lidas das variáveis de ambiente (arquivo .env.local).

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Log para verificar se as variáveis de ambiente estão sendo carregadas (apenas para depuração)
// console.log("API Key lida do .env.local:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

// Configuração do Firebase para seu aplicativo web
// As credenciais são carregadas a partir das variáveis de ambiente (definidas em .env.local)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Opcional
};

// Verifica se todas as chaves obrigatórias do Firebase estão presentes
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket ||
  !firebaseConfig.messagingSenderId ||
  !firebaseConfig.appId
) {
  console.error(
    "Erro de configuração do Firebase: Uma ou mais variáveis de ambiente NEXT_PUBLIC_FIREBASE_... não foram definidas.",
    "Verifique seu arquivo .env.local e as configurações do projeto Firebase."
  );
  // Você pode querer lançar um erro aqui ou lidar com isso de outra forma,
  // dependendo de como sua aplicação deve se comportar sem o Firebase.
}

// Inicializa o app Firebase (ou obtém a instância já existente)
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// Instâncias de Auth e Firestore garantidas sem null
const auth = getAuth(app);
const db = getFirestore(app);

// Provedor Google para autenticação
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
