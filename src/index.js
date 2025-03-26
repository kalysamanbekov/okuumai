import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import TrialBanner from './components/TrialBanner';

// Простой компонент для отображения в случае ошибки
const ErrorFallback = ({ error }) => (
  <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
    <h1 style={{ color: '#e11d48' }}>OKUUM.AI - Ошибка</h1>
    <p>При загрузке приложения произошла ошибка:</p>
    <pre style={{ padding: '10px', backgroundColor: '#f8f8f8', overflow: 'auto', borderRadius: '4px' }}>
      {error?.message || 'Неизвестная ошибка'}
    </pre>
  </div>
);

// Проверяем наличие элемента root
const container = document.getElementById('root');

if (!container) {
  console.error('Элемент #root не найден! Убедитесь, что вы открыли правильный HTML-файл (react-app.html)');
  // Создаем временный контейнер для отображения ошибки
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #e11d48;">OKUUM.AI - Ошибка</h1>
      <p>Элемент #root не найден! Возможные решения:</p>
      <ul>
        <li>Откройте <a href="/react-app.html">/react-app.html</a> вместо текущей страницы</li>
        <li>Добавьте <code>&lt;div id="root"&gt;&lt;/div&gt;</code> в текущий HTML-файл</li>
      </ul>
    </div>
  `;
  document.body.appendChild(tempContainer);
} else {
  console.log('Начинаем рендеринг приложения');
  const root = createRoot(container);

  try {
    root.render(
    <React.StrictMode>
      <Theme>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Theme>
    </React.StrictMode>
  );
  console.log('Приложение успешно отрендерено');
} catch (error) {
  console.error('Ошибка рендеринга:', error);
  // Показываем ошибку на странице
  root.render(
    <React.StrictMode>
      <ErrorFallback error={error} />
    </React.StrictMode>
  );
}
}

// Инициализация баннера триала на HTML-страницах
const trialBannerContainer = document.getElementById('trial-banner-container');
if (trialBannerContainer) {
  console.log('Инициализация баннера триала');
  try {
    const trialBannerRoot = createRoot(trialBannerContainer);
    trialBannerRoot.render(
      <React.StrictMode>
        <TrialBanner />
      </React.StrictMode>
    );
    console.log('Баннер триала успешно инициализирован');
  } catch (error) {
    console.error('Ошибка инициализации баннера триала:', error);
  }
}
