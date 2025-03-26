import { auth } from './firebase.js';

// Проверка аутентификации
const initAuth = () => {
  auth.onAuthStateChanged((user) => {
    if (!user) {
      // Пользователь не аутентифицирован, перенаправляем на страницу входа
      window.location.href = 'login.html';
    } else {
      // Пользователь аутентифицирован, показываем содержимое страницы
      const pageContent = document.getElementById('page-content');
      if (pageContent) {
        pageContent.style.display = 'block';
      }
      
      // Отображаем имя пользователя в шапке
      const userName = document.getElementById('user-name');
      if (userName) {
        const userDisplayName = user.displayName || user.email.split('@')[0];
        userName.textContent = userDisplayName;
      }
      
      // Настраиваем кнопку выхода
      const logoutButton = document.getElementById('logout-button');
      if (logoutButton) {
        logoutButton.addEventListener('click', () => {
          auth.signOut().then(() => {
            window.location.href = 'login.html';
          });
        });
      }
    }
  });
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initAuth);

export { initAuth };
