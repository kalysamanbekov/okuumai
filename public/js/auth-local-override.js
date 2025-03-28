/**
 * Обходное решение для локальной аутентификации
 * Этот скрипт позволяет эмулировать работу аутентификации Firebase на локальном сервере
 */

// Проверяем, запущено ли приложение локально
const isLocalHost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname.includes('127.0.0.1');

if (isLocalHost) {
  console.log('Запущен локальный режим аутентификации');
  
  // Переопределяем методы Firebase, которые вызывают перенаправление
  if (typeof firebase !== 'undefined' && firebase.auth) {
    // Сохраняем оригинальные методы
    const originalSignInWithRedirect = firebase.auth.prototype.signInWithRedirect;
    
    // Переопределяем метод signInWithRedirect для локальной версии
    firebase.auth.prototype.signInWithRedirect = function(provider) {
      console.log('Перехвачен вызов signInWithRedirect');
      
      // Эмулируем успешный вход
      // Создаем фейкового пользователя
      const fakeUser = {
        uid: 'local-user-' + Date.now(),
        email: 'local-dev@example.com',
        displayName: 'Local Developer',
        emailVerified: true,
        isAnonymous: false,
        providerData: [
          {
            providerId: provider.providerId,
            uid: 'local-dev@example.com',
            displayName: 'Local Developer',
            email: 'local-dev@example.com',
            phoneNumber: null,
            photoURL: null
          }
        ],
        getIdToken: () => Promise.resolve('fake-token-for-local-development'),
        toJSON: () => ({
          uid: 'local-user-' + Date.now(),
          email: 'local-dev@example.com',
          displayName: 'Local Developer'
        })
      };
      
      // Сохраняем в локальное хранилище информацию о фейковой авторизации
      localStorage.setItem('fakeFirbaseAuthUser', JSON.stringify(fakeUser));
      localStorage.setItem('fakeFirbaseAuthActive', 'true');
      
      // Перенаправляем на главную страницу
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1000);
      
      return Promise.resolve();
    };
    
    // Переопределяем метод getRedirectResult
    const originalGetRedirectResult = firebase.auth.prototype.getRedirectResult;
    firebase.auth.prototype.getRedirectResult = function() {
      console.log('Перехвачен вызов getRedirectResult');
      
      // Проверяем, был ли фейковый вход
      const fakeAuthActive = localStorage.getItem('fakeFirbaseAuthActive');
      if (fakeAuthActive === 'true') {
        const fakeUser = JSON.parse(localStorage.getItem('fakeFirbaseAuthUser'));
        return Promise.resolve({ user: fakeUser });
      }
      
      // Если не использовался фейковый вход, вызываем оригинальный метод
      return originalGetRedirectResult.apply(this, arguments);
    };
    
    // Переопределяем onAuthStateChanged для фейкового пользователя
    const originalOnAuthStateChanged = firebase.auth.prototype.onAuthStateChanged;
    firebase.auth.prototype.onAuthStateChanged = function(callback) {
      console.log('Перехвачен вызов onAuthStateChanged');
      
      // Проверяем, был ли фейковый вход
      const fakeAuthActive = localStorage.getItem('fakeFirbaseAuthActive');
      if (fakeAuthActive === 'true') {
        const fakeUser = JSON.parse(localStorage.getItem('fakeFirbaseAuthUser'));
        // Вызываем колбэк с фейковым пользователем
        setTimeout(() => callback(fakeUser), 100);
        return () => {}; // Возвращаем пустую функцию unsubscribe
      }
      
      // Если не использовался фейковый вход, вызываем оригинальный метод
      return originalOnAuthStateChanged.apply(this, arguments);
    };
  }
  
  // Добавляем отладочный элемент на страницу
  document.addEventListener('DOMContentLoaded', () => {
    const debugBanner = document.createElement('div');
    debugBanner.style.position = 'fixed';
    debugBanner.style.bottom = '10px';
    debugBanner.style.right = '10px';
    debugBanner.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugBanner.style.color = 'white';
    debugBanner.style.padding = '10px';
    debugBanner.style.borderRadius = '5px';
    debugBanner.style.zIndex = '9999';
    debugBanner.style.fontSize = '12px';
    debugBanner.innerHTML = 'Локальный режим аутентификации активен';
    
    const clearFakeAuthButton = document.createElement('button');
    clearFakeAuthButton.innerText = 'Сбросить фейковую авторизацию';
    clearFakeAuthButton.style.display = 'block';
    clearFakeAuthButton.style.marginTop = '5px';
    clearFakeAuthButton.style.fontSize = '10px';
    clearFakeAuthButton.style.padding = '3px';
    clearFakeAuthButton.onclick = () => {
      localStorage.removeItem('fakeFirbaseAuthUser');
      localStorage.removeItem('fakeFirbaseAuthActive');
      window.location.reload();
    };
    
    debugBanner.appendChild(clearFakeAuthButton);
    document.body.appendChild(debugBanner);
  });
}
