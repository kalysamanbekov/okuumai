import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import Auth from './components/Auth';
import './styles/App.css';
import './styles/global.css';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';

// Упрощенный компонент сообщения чата
const ChatMessage = ({ sender, content }) => {
  return (
    <div className={`message ${sender}`}>
      <div className="avatar">
        {sender === 'user' ? 'U' : 'A'}
      </div>
      <div className="content">
        {content}
      </div>
    </div>
  );
};

function App() {
  const [user, loading] = useAuthState(auth);
  console.log('App rendered, auth state:', { user, loading });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Функция для обработки успешной аутентификации
  const handleAuthSuccess = (user) => {
    console.log('Пользователь аутентифицирован:', user);
  };

  // Показываем индикатор загрузки, пока проверяется состояние аутентификации
  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        flexDirection: 'column'
      }}>
        <div className="loading-spinner" style={{
          width: '50px', 
          height: '50px', 
          border: '5px solid #f3f3f3', 
          borderTop: '5px solid #3498db', 
          borderRadius: '50%'
        }}></div>
        <p style={{marginTop: '20px'}}>Загрузка...</p>
      </div>
    );
  }

  // Тестовый режим - всегда показываем компонент Auth для тестирования
  return (
    <ThemeProvider>
      <div style={{padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh'}}>
        <h1 style={{textAlign: 'center', marginBottom: '20px'}}>OKUUM.AI - Тест аутентификации</h1>
        <Auth onAuthSuccess={handleAuthSuccess} />
        
        {/* Показываем информацию о пользователе, если он аутентифицирован */}
        {user && (
          <div style={{
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#e6f7ff', 
            border: '1px solid #91d5ff', 
            borderRadius: '5px'
          }}>
            <h3>Вы вошли как:</h3>
            <p><strong>Email:</strong> {user.email || 'Не указан'}</p>
            <p><strong>Имя:</strong> {user.displayName || 'Не указано'}</p>
            <p><strong>ID:</strong> {user.uid}</p>
            <button 
              onClick={() => auth.signOut()} 
              style={{
                backgroundColor: '#ff4d4f', 
                color: 'white', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '4px', 
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Выйти из аккаунта
            </button>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
