import React, { useState, useEffect } from 'react';
import { auth, registerWithEmailAndPassword, loginWithEmailAndPassword, signInWithGoogle, logoutUser } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/Auth.css';

const Auth = ({ onAuthSuccess }) => {
  console.log('Auth component rendered');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Если пользователь аутентифицирован, вызываем колбэк
        onAuthSuccess && onAuthSuccess(currentUser);
      }
    });

    return () => unsubscribe();
  }, [onAuthSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await loginWithEmailAndPassword(email, password);
      } else {
        result = await registerWithEmailAndPassword(email, password);
      }

      if (result.error) {
        setError(getReadableErrorMessage(result.error.code));
      }
    } catch (err) {
      setError('Произошла ошибка при обработке запроса');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(getReadableErrorMessage(result.error.code));
      }
    } catch (err) {
      setError('Произошла ошибка при входе через Google');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } catch (err) {
      console.error('Ошибка при выходе из системы:', err);
    } finally {
      setLoading(false);
    }
  };

  // Функция для преобразования кодов ошибок Firebase в читаемые сообщения
  const getReadableErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Неверный формат электронной почты';
      case 'auth/user-disabled':
        return 'Этот аккаунт отключен';
      case 'auth/user-not-found':
        return 'Пользователь с таким email не найден';
      case 'auth/wrong-password':
        return 'Неверный пароль';
      case 'auth/email-already-in-use':
        return 'Этот email уже используется';
      case 'auth/weak-password':
        return 'Пароль слишком простой (минимум 6 символов)';
      case 'auth/popup-closed-by-user':
        return 'Окно авторизации было закрыто до завершения';
      default:
        return `Ошибка: ${errorCode}`;
    }
  };

  // Если пользователь уже вошел, показываем информацию и кнопку выхода
  if (user) {
    console.log('User is authenticated:', user);
    return (
      <div className="auth-container logged-in" style={{backgroundColor: '#e6f7ff', border: '2px solid #1890ff'}}>
        <div className="user-info">
          <img 
            src={user.photoURL || 'https://via.placeholder.com/100'} 
            alt="Аватар пользователя" 
            className="user-avatar"
          />
          <h2>Добро пожаловать!</h2>
          <p>Вы вошли как: {user.displayName || user.email}</p>
          <button 
            onClick={handleLogout} 
            className="auth-button logout-button" 
            disabled={loading}
          >
            {loading ? 'Выполняется выход...' : 'Выйти'}
          </button>
        </div>
      </div>
    );
  }

  console.log('Rendering Auth form for non-authenticated user');
  return (
    <div className="auth-container" style={{backgroundColor: '#ffe6e6', border: '2px solid #ff4d4f'}}>
      <div className="auth-card">
        <h2>{isLogin ? 'Вход в OKUUM.AI' : 'Регистрация в OKUUM.AI'}</h2>
        <p className="auth-subtitle">
          {isLogin 
            ? 'Войдите, чтобы получить доступ к образовательным материалам' 
            : 'Создайте аккаунт для доступа к образовательным материалам'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Введите ваш email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Введите ваш пароль"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading 
              ? 'Подождите...' 
              : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-divider">
          <span>или</span>
        </div>

        <button 
          onClick={handleGoogleSignIn} 
          className="auth-button google-button" 
          disabled={loading}
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
            alt="Google logo" 
            className="google-icon" 
          />
          Войти через Google
        </button>

        <p className="auth-toggle">
          {isLogin 
            ? 'Нет аккаунта? ' 
            : 'Уже есть аккаунт? '}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            className="toggle-button" 
            disabled={loading}
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
