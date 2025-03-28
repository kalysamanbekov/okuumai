import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import Auth from './components/Auth';
import StreamChat from './components/StreamChat';
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

  const [activeTab, setActiveTab] = useState('chat'); // 'auth' или 'chat'
  
  return (
    <ThemeProvider>
      <div style={{padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0 }}>OKUUM.AI</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setActiveTab('chat')}
              style={{
                backgroundColor: activeTab === 'chat' ? '#1890ff' : '#e6f7ff',
                color: activeTab === 'chat' ? 'white' : '#1890ff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Чат
            </button>
            <button 
              onClick={() => setActiveTab('auth')}
              style={{
                backgroundColor: activeTab === 'auth' ? '#1890ff' : '#e6f7ff',
                color: activeTab === 'auth' ? 'white' : '#1890ff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Аутентификация
            </button>
            {user && (
              <button 
                onClick={() => auth.signOut()} 
                style={{
                  backgroundColor: '#ff4d4f', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: '4px', 
                  cursor: 'pointer'
                }}
              >
                Выйти
              </button>
            )}
          </div>
        </div>
        
        {activeTab === 'auth' ? (
          // Раздел аутентификации
          <div>
            <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Управление аккаунтом</h2>
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
              </div>
            )}
          </div>
        ) : (
          // Раздел чата с потоковой передачей
          <StreamChat />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
