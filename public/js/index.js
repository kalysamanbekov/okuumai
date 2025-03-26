// u0418u043cu043fu043eu0440u0442u0438u0440u0443u0435u043c u043du0435u043eu0431u0445u043eu0434u0438u043cu044bu0435 u043cu043eu0434u0443u043bu0438
import { auth, getGoogleRedirectResult } from './firebase.js';

// u041fu0440u043eu0432u0435u0440u043au0430 u0440u0435u0437u0443u043bu044cu0442u0430u0442u0430 u0430u0443u0442u0435u043du0442u0438u0444u0438u043au0430u0446u0438u0438 u0447u0435u0440u0435u0437 Google
const checkGoogleRedirect = async () => {
  try {
    const result = await getGoogleRedirectResult();
    if (result.user) {
      console.log('u0423u0441u043fu0435u0448u043du044bu0439 u0432u0445u043eu0434 u0447u0435u0440u0435u0437 Google:', result.user.email);
    }
  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043fu043eu043bu0443u0447u0435u043du0438u0438 u0440u0435u0437u0443u043bu044cu0442u0430u0442u0430 u0430u0443u0442u0435u043du0442u0438u0444u0438u043au0430u0446u0438u0438 Google:', error);
  }
};



// u041fu0440u043eu0432u0435u0440u043au0430 u0441u043eu0441u0442u043eu044fu043du0438u044f u0430u0443u0442u0435u043du0442u0438u0444u0438u043au0430u0446u0438u0438
const initAuth = () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log('u041fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044c u0430u0432u0442u043eu0440u0438u0437u043eu0432u0430u043d:', user.email);
      // u041fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044c u0430u0432u0442u043eu0440u0438u0437u043eu0432u0430u043d, u043cu043eu0436u043du043e u0434u043eu0431u0430u0432u0438u0442u044c u0434u043eu043fu043eu043bu043du0438u0442u0435u043bu044cu043du0443u044e u043bu043eu0433u0438u043au0443 u043fu0440u0438 u043du0435u043eu0431u0445u043eu0434u0438u043cu043eu0441u0442u0438
    } else {
      console.log('u041fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044c u043du0435 u0430u0432u0442u043eu0440u0438u0437u043eu0432u0430u043d');
      // u041fu0435u0440u0435u043du0430u043fu0440u0430u0432u043bu044fu0435u043c u043du0430 u0441u0442u0440u0430u043du0438u0446u0443 u0432u0445u043eu0434u0430, u0435u0441u043bu0438 u043cu044b u043du0435 u043du0430 u043du0435u0439
      const currentPath = window.location.pathname;
      if (!currentPath.includes('login.html') && !currentPath.includes('register.html') && currentPath !== '/') {
        window.location.href = 'login.html';
      }
    }
  });
};

// u0418u043du0438u0446u0438u0430u043bu0438u0437u0430u0446u0438u044f u043fu0440u0438u043bu043eu0436u0435u043du0438u044f
const initApp = () => {
  console.log('u0418u043du0438u0446u0438u0430u043bu0438u0437u0430u0446u0438u044f u043fu0440u0438u043bu043eu0436u0435u043du0438u044f...');
  
  // u0421u043du0430u0447u0430u043bu0430 u043fu0440u043eu0432u0435u0440u044fu0435u043c u0440u0435u0437u0443u043bu044cu0442u0430u0442 u0430u0443u0442u0435u043du0442u0438u0444u0438u043au0430u0446u0438u0438 u0447u0435u0440u0435u0437 Google
  checkGoogleRedirect()
    .then(() => {
      // u0417u0430u0442u0435u043c u0438u043du0438u0446u0438u0430u043bu0438u0437u0438u0440u0443u0435u043c u0430u0443u0442u0435u043du0442u0438u0444u0438u043au0430u0446u0438u044e
      initAuth();
      

    })
    .catch(error => {
      console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u0438u043du0438u0446u0438u0430u043bu0438u0437u0430u0446u0438u0438 u043fu0440u0438u043bu043eu0436u0435u043du0438u044f:', error);
    });
};

// Функция для инициализации таймера отсчета времени триала
const initTrialTimer = () => {
  // Проверяем, есть ли элемент таймера на странице
  const timerElement = document.getElementById('timer');
  if (!timerElement) return;
  
  // Проверяем, есть ли в localStorage время начала триала
  let trialStartTime = localStorage.getItem('trialStartTime');
  
  // Если нет, устанавливаем текущее время как время начала триала
  if (!trialStartTime) {
    trialStartTime = Date.now();
    localStorage.setItem('trialStartTime', trialStartTime);
  }
  
  // Функция для обновления таймера
  function updateTimer() {
    const currentTime = Date.now();
    const trialStartTimeMs = parseInt(trialStartTime);
    
    // Время триала - 24 часа (86400000 мс)
    const trialDuration = 86400000;
    
    // Вычисляем оставшееся время
    let timeLeft = trialDuration - (currentTime - trialStartTimeMs);
    
    // Если время истекло, показываем 00:00:00
    if (timeLeft <= 0) {
      timerElement.textContent = '00:00:00';
      return;
    }
    
    // Преобразуем миллисекунды в часы, минуты и секунды
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    timeLeft %= (1000 * 60 * 60);
    const minutes = Math.floor(timeLeft / (1000 * 60));
    timeLeft %= (1000 * 60);
    const seconds = Math.floor(timeLeft / 1000);
    
    // Форматируем время в виде HH:MM:SS
    timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Обновляем таймер каждую секунду
  updateTimer();
  setInterval(updateTimer, 1000);
};

// u0417u0430u043fu0443u0441u043a u043fu0440u0438u043bu043eu0436u0435u043du0438u044f u043fu043eu0441u043bu0435 u0437u0430u0433u0440u0443u0437u043au0438 u0441u0442u0440u0430u043du0438u0446u044b
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  initTrialTimer();
});
