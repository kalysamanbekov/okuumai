import { auth, checkTrialStatus } from './firebase.js';

// Проверка аутентификации
const initAuth = () => {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      // Пользователь не аутентифицирован, перенаправляем на страницу входа
      window.location.href = '/public/login.html';
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
            window.location.href = '/public/login.html';
          });
        });
      }
      
      // Проверяем статус триала
      try {
        // Проверяем валидность email перед запросом к Firestore
        const userEmail = user.email;
        const allowedDomains = ['gmail.com', 'mail.ru', 'outlook.com', 'yandex.ru', 'yandex.com', 'hotmail.com'];
        const emailDomain = userEmail.split('@')[1];
        
        if (!allowedDomains.includes(emailDomain)) {
          // Неразрешенный домен email
          console.error('Неразрешенный домен email:', emailDomain);
          alert('Доступ запрещен. Пожалуйста, используйте разрешенный email для входа.');
          auth.signOut();
          return;
        }
        
        await checkTrialStatus(user.uid)
          .then(({ trialActive, timeLeft, isPremium, error }) => {
          // Получаем элемент таймера
          const timerElement = document.getElementById('timer');
          if (!timerElement) return;
          
          // Обновляем таймер с данными из Firebase
          if (trialActive) {
            if (isPremium) {
              // Если есть премиум-доступ, показываем соответствующее сообщение
              timerElement.textContent = 'Безлимитно';
            } else {
              // Обновляем таймер с оставшимся временем
              timerElement.textContent = timeLeft;
              
              // Запускаем интервал для обновления таймера каждую секунду
              const updateTimerInterval = setInterval(async () => {
                const result = await checkTrialStatus(user.uid);
                if (result.trialActive) {
                  timerElement.textContent = result.timeLeft;
                } else {
                  timerElement.textContent = '00:00:00';
                  clearInterval(updateTimerInterval);
                  
                  // Показываем сообщение о необходимости оплаты
                  const promoTitle = document.querySelector('.promo-title');
                  if (promoTitle) {
                    promoTitle.textContent = 'Ваш бесплатный период закончился';
                  }
                  
                  const promoText = document.querySelector('.promo-text');
                  if (promoText) {
                    promoText.innerHTML = 'Приобретите полный доступ для продолжения подготовки.<br>Осталось времени: <span id="timer">00:00:00</span>';
                  }
                }
              }, 1000);
            }
          } else {
            // Триал неактивен, показываем 00:00:00 и предложение оплаты
            timerElement.textContent = '00:00:00';
            
            // Показываем сообщение о необходимости оплаты
            const promoTitle = document.querySelector('.promo-title');
            if (promoTitle) {
              promoTitle.textContent = 'Ваш бесплатный период закончился';
            }
            
            const promoText = document.querySelector('.promo-text');
            if (promoText) {
              promoText.innerHTML = 'Приобретите полный доступ для продолжения подготовки.<br>Осталось времени: <span id="timer">00:00:00</span>';
            }
          }
        })
        .catch(error => {
          console.error('Ошибка при проверке статуса триала:', error);
          
          // Получаем элемент таймера
          const timerElement = document.getElementById('timer');
          if (timerElement) {
            // Установка значения таймера по умолчанию при ошибке
            timerElement.textContent = '23:59:59';
          }
          
          // Проверяем, есть ли сохраненные данные о триале в localStorage
          const localTrialData = localStorage.getItem(`trial_${user.uid}`);
          if (localTrialData) {
            const { trialActive, timeLeft } = JSON.parse(localTrialData);
            if (timerElement && trialActive) {
              timerElement.textContent = timeLeft || '23:59:59';
            }
          } else {
            // Если нет данных, создаем новые с дефолтным значением
            localStorage.setItem(`trial_${user.uid}`, JSON.stringify({
              trialActive: true,
              timeLeft: '23:59:59',
              trialStartedAt: new Date().toISOString()
            }));
          }

        });
      } catch (error) {
        console.error('Ошибка при обработке статуса триала:', error);
        // Показываем стандартный таймер при ошибке
        const timerElement = document.getElementById('timer');
        if (timerElement) {
          timerElement.textContent = '23:59:59';
        }
      }
    }
  });
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initAuth);

export { initAuth };
