import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';

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

const container = document.getElementById('root');
const root = createRoot(container);

console.log('Начинаем рендеринг приложения');

try {
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
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
