import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js';
import { getFirestore, doc, collection, setDoc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
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
    // Если пользователь новый, создаем запись с триалом
    const userData = {
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      trial_active: true,
      trial_started_at: serverTimestamp(),
      premium_access: false
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

// Проверка статуса триала и обновление его если нужно
const checkTrialStatus = async (userId) => {
  try {
    // Проверяем, есть ли данные в localStorage на случай офлайн-режима
    const localTrialData = localStorage.getItem(`trial_${userId}`);
    let localData = null;
    
    if (localTrialData) {
      try {
        localData = JSON.parse(localTrialData);
        console.log('Используются локальные данные триала:', localData);
      } catch (e) {
        console.error('Ошибка при чтении локальных данных:', e);
      }
    }
    
    // Получаем данные пользователя из Firestore
    const { userData, error } = await getUserData(userId);
    
    // Если есть ошибка при получении данных из Firestore, используем локальные данные
    if (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      
      // Если есть локальные данные, используем их
      if (localData) {
        // Вычисляем оставшееся время на основе локальных данных
        if (localData.trialActive) {
          return { 
            trialActive: true, 
            timeLeft: localData.timeLeft || '23:59:59',
            isPremium: false,
            error: null 
          };
        } else {
          return { trialActive: false, error: null };
        }
      }
      
      // Если нет ни данных из Firestore, ни локальных данных, создаем новый триал
      const defaultTimeLeft = '23:59:59';
      localStorage.setItem(`trial_${userId}`, JSON.stringify({
        trialActive: true,
        timeLeft: defaultTimeLeft,
        trialStartedAt: new Date().toISOString()
      }));
      
      return { 
        trialActive: true, 
        timeLeft: defaultTimeLeft,
        isPremium: false,
        error: null 
      };
    }
    
    // Если у пользователя есть премиум-доступ
    if (userData.premium_access) {
      return { trialActive: true, isPremium: true, error: null };
    }
    
    // Если триал неактивен, возвращаем false
    if (!userData.trial_active) {
      return { trialActive: false, error: null };
    }
    
    // Проверяем, прошло ли 24 часа с момента начала триала
    const trialStartedAt = userData.trial_started_at.toDate();
    const currentTime = new Date();
    const trialDuration = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
    
    // Вычисляем разницу во времени
    const timeDiff = currentTime - trialStartedAt;
    
    // Если прошло больше 24 часов, обновляем статус триала
    if (timeDiff > trialDuration) {
      // Обновляем статус триала в базе данных
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        trial_active: false
      });
      
      return { trialActive: false, error: null };
    }
    
    // Вычисляем оставшееся время триала
    const timeLeft = trialDuration - timeDiff;
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    // Форматируем оставшееся время
    const formattedTimeLeft = `${hoursLeft.toString().padStart(2, '0')}:${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
    
    // Сохраняем данные в localStorage для офлайн-режима
    localStorage.setItem(`trial_${userId}`, JSON.stringify({
      trialActive: true,
      timeLeft: formattedTimeLeft,
      trialStartedAt: trialStartedAt.toISOString()
    }));
    
    return { 
      trialActive: true, 
      timeLeft: formattedTimeLeft,
      error: null 
    };
  } catch (error) {
    console.error('Ошибка при проверке статуса триала:', error);
    return { trialActive: false, error };
  }
};


// Загрузка скриншота об оплате
const uploadPaymentScreenshot = async (userId, file) => {
  try {
    // Создаем простое имя файла
    const timestamp = Date.now();
    const storageRef = ref(storage, `payment_screenshots/${userId}_${timestamp}`);
    
    // Загружаем файл в Firebase Storage
    await uploadBytes(storageRef, file);
    
    // Получаем URL загруженного файла
    const downloadURL = await getDownloadURL(storageRef);
    
    return { url: downloadURL, error: null };
  } catch (error) {
    console.error("Ошибка при загрузке скриншота:", error);
    return { url: null, error: error.message || 'Произошла ошибка при загрузке файла' };
  }
};

// Сохранение информации о платеже
const submitPaymentInfo = async (userId, fullName, file) => {
  try {
    // Проверяем входные данные
    if (!userId) {
      throw new Error('Идентификатор пользователя не указан');
    }
    
    if (!fullName || fullName.trim().length < 3) {
      throw new Error('Пожалуйста, укажите корректное ФИО (минимум 3 символа)');
    }
    
    if (!file) {
      throw new Error('Файл не выбран');
    }
    
    // Загружаем скриншот
    const { url, error } = await uploadPaymentScreenshot(userId, file);
    
    if (error) {
      return { success: false, error };
    }
    
    // Обновляем данные пользователя
    await updateDoc(doc(db, "users", userId), {
      payment_full_name: fullName.trim(),
      payment_status: 'pending',
      payment_screenshot_url: url,
      payment_submitted_at: serverTimestamp(),
      payment_file_name: file.name,
      payment_file_size: file.size
    });
    
    // Убрали запись в отдельную коллекцию, так как это могло вызывать ошибку
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Ошибка при отправке информации о платеже:", error);
    return { success: false, error: error.message || 'Произошла ошибка при отправке данных' };
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
