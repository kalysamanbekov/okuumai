import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import ShadcnAuthForm from './components/ShadcnAuthForm';
import ShadcnDemo from './components/ShadcnDemo';
import './styles/App.css';
import './styles/globals.css';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import TrialBanner from './components/TrialBanner';

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

  // Показываем демо-страницу Shadcn/UI
  return (
    <ThemeProvider>
      <div className="bg-background min-h-screen">
        <header className="border-b border-border p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">OKUUM.AI</h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {user && (
                <button 
                  onClick={() => auth.signOut()} 
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Выйти ({user.email})
                </button>
              )}
            </div>
          </div>
        </header>
        
        {/* Показываем баннер триала, если пользователь авторизован */}
        {user && <TrialBanner />}
        
        {/* Основное содержимое */}
        <main>
          {!user ? (
            <div className="container mx-auto p-6">
              <h2 className="text-2xl font-bold text-center mb-6">Войдите в систему</h2>
              <ShadcnAuthForm onAuthSuccess={handleAuthSuccess} />
            </div>
          ) : (
            <ShadcnDemo />
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
