import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js';

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
const db = getFirestore(app);
const storage = getStorage(app);

// Инициализация аналитики (только в браузерной среде)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Функция для регистрации пользователя с email и паролем
const registerWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Создаем запись пользователя в Firestore и активируем триал
    await createUserProfile(userCredential.user);
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
    await signInWithRedirect(auth, googleProvider);
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Функция для получения результата аутентификации после перенаправления
const getGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // Создаем запись пользователя в Firestore и активируем триал
      await createUserProfile(result.user);
      return { user: result.user, error: null };
    }
    return { user: null, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

// Функция для выхода из аккаунта
const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Функция для сброса пароля
const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Создание или обновление профиля пользователя в Firestore
const createUserProfile = async (user) => {
  if (!user) return;
  
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // Если пользователь новый, создаем запись и активируем триал
    const userData = {
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      // Данные для триала
      trial_active: true,
      trial_started_at: serverTimestamp()
    };
    
    await setDoc(userRef, userData);
  } else {
    // Если пользователь уже существует, обновляем время последнего входа
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });
  }
};

// Получение данных пользователя
const getUserData = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { userData: userSnap.data(), error: null };
    } else {
      return { userData: null, error: "Пользователь не найден" };
    }
  } catch (error) {
    return { userData: null, error };
  }
};

// Проверка статуса триала пользователя
const checkTrialStatus = async (userId) => {
  try {
    const { userData, error } = await getUserData(userId);
    
    if (error || !userData) {
      return { isActive: false, timeLeft: 0, error: error || "Данные пользователя не найдены" };
    }
    
    // Если триал не был активирован
    if (!userData.trial_active || !userData.trial_started_at) {
      return { isActive: false, timeLeft: 0, error: null };
    }
    
    // Получаем время начала триала
    const trialStartedAt = userData.trial_started_at.toDate();
    const now = new Date();
    
    // Вычисляем разницу в миллисекундах
    const trialDuration = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
    const elapsedTime = now.getTime() - trialStartedAt.getTime();
    const timeLeft = trialDuration - elapsedTime;
    
    // Проверяем, не истек ли триал
    if (timeLeft <= 0) {
      // Обновляем статус триала в Firestore
      await updateDoc(doc(db, "users", userId), {
        trial_active: false
      });
      
      return { isActive: false, timeLeft: 0, error: null };
    }
    
    return { isActive: true, timeLeft, error: null };
  } catch (error) {
    console.error("Ошибка при проверке статуса триала:", error);
    return { isActive: false, timeLeft: 0, error };
  }
};

// Загрузка скриншота об оплате
const uploadPaymentScreenshot = async (userId, file) => {
  try {
    const storageRef = ref(storage, `payment_screenshots/${userId}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Обновляем данные пользователя с информацией о платеже
    await updateDoc(doc(db, "users", userId), {
      payment_status: 'pending',
      payment_screenshot_url: downloadURL,
      payment_submitted_at: serverTimestamp()
    });
    
    return { url: downloadURL, error: null };
  } catch (error) {
    console.error("Ошибка при загрузке скриншота:", error);
    return { url: null, error };
  }
};

// Сохранение информации о платеже
const submitPaymentInfo = async (userId, fullName, file) => {
  try {
    // Загружаем скриншот
    const { url, error } = await uploadPaymentScreenshot(userId, file);
    
    if (error) {
      return { success: false, error };
    }
    
    // Обновляем данные пользователя
    await updateDoc(doc(db, "users", userId), {
      payment_full_name: fullName,
      payment_status: 'pending',
      payment_screenshot_url: url,
      payment_submitted_at: serverTimestamp()
    });
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Ошибка при отправке информации о платеже:", error);
    return { success: false, error };
  }
};

export { 
  auth, 
  analytics, 
  db,
  storage,
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  signInWithGoogle,
  getGoogleRedirectResult,
  logoutUser,
  resetPassword,
  createUserProfile,
  getUserData,
  checkTrialStatus,
  uploadPaymentScreenshot,
  submitPaymentInfo
};
