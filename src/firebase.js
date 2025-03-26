import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

/*
* ИНСТРУКЦИИ ПО НАСТРОЙКЕ FIREBASE АУТЕНТИФИКАЦИИ:
* 
* 1. В разделе Authentication включите методы входа 'Email/Password' и 'Google'
* 2. Добавьте домены в Authentication → Settings → Authorized domains:
*    - localhost (для локальной разработки)
*    - okuumai.onrender.com (для продакшн сервера)
*/

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyChyT-UwWG1dqh3j_kOoeWbpJ0i6hVwHhk",
  authDomain: "okkumai.firebaseapp.com",
  projectId: "okkumai",
  storageBucket: "okkumai.firebasestorage.app",
  messagingSenderId: "517438098193",
  appId: "1:517438098193:web:20d1d96ebb705956fedab0",
  measurementId: "G-94J67BQ8N4"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Инициализация аналитики (только в браузерной среде)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Функция для регистрации пользователя с email и паролем
const registerWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

// Функция для входа с email и паролем
const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

// Функция для входа через Google с перенаправлением
const signInWithGoogle = async () => {
  try {
    // Перенаправляем пользователя на страницу аутентификации Google
    await signInWithRedirect(auth, googleProvider);
    // Эта функция не вернет результат напрямую, так как происходит перенаправление
    return { user: null, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

// Функция для получения результата аутентификации после перенаправления
const getGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return { user: result.user, error: null };
    }
    return { user: null, error: null }; // Нет результата, но и нет ошибки
  } catch (error) {
    return { user: null, error };
  }
};

// Функция для выхода из аккаунта
const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

// Функция для сброса пароля
const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

export { auth, analytics, registerWithEmailAndPassword, loginWithEmailAndPassword, signInWithGoogle, getGoogleRedirectResult, resetPassword, logoutUser };
