// Скрипт для проверки информации о пользователе
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDFbMRVjZlMlKVXH-Bz9mTUJRrKI5Kx-Vo",
  authDomain: "okuumai-chat.firebaseapp.com",
  projectId: "okuumai-chat",
  storageBucket: "okuumai-chat.appspot.com",
  messagingSenderId: "1088940416675",
  appId: "1:1088940416675:web:6a0c1a0e1c4f5a8c0e9b7c",
  measurementId: "G-XVWM5RLPXM"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Функция для получения данных пользователя
async function getUserInfo(email) {
  try {
    // Сначала нужно найти пользователя по email
    const users = document.getElementById('user-info');
    users.innerHTML = '<p>Поиск пользователя...</p>';
    
    // Получаем UID пользователя через аутентификацию
    // Обратите внимание: для этого нужны права администратора или знать пароль пользователя
    // В реальном приложении лучше использовать Cloud Functions или Admin SDK
    
    // Для демонстрации просто выводим сообщение
    users.innerHTML = `<p>Для получения информации о пользователе ${email} необходимо использовать Firebase Admin SDK или Cloud Functions.</p>
                       <p>В реальном приложении вы бы создали защищенную Cloud Function, которая:</p>
                       <ol>
                         <li>Проверяет права доступа вызывающего пользователя</li>
                         <li>Находит пользователя по email через Admin SDK</li>
                         <li>Получает данные пользователя из Firestore</li>
                         <li>Возвращает информацию о дате регистрации</li>
                       </ol>
                       <p>Для локальной разработки вы можете использовать Firebase Emulator Suite.</p>`;
  } catch (error) {
    console.error("Ошибка при получении данных пользователя:", error);
    document.getElementById('user-info').innerHTML = `<p>Ошибка: ${error.message}</p>`;
  }
}

// Запуск функции при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('search-button');
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      const email = document.getElementById('email-input').value;
      if (email) {
        getUserInfo(email);
      }
    });
  }
});
