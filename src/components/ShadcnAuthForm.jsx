import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { auth, loginWithEmailAndPassword, registerWithEmailAndPassword, signInWithGoogle } from '../firebase';

const ShadcnAuthForm = ({ onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        await registerWithEmailAndPassword(name, email, password);
      } else {
        await loginWithEmailAndPassword(email, password);
      }
      if (onAuthSuccess) onAuthSuccess(auth.currentUser);
    } catch (err) {
      setError(err.message);
      console.error('Ошибка аутентификации:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      if (onAuthSuccess) onAuthSuccess(auth.currentUser);
    } catch (err) {
      setError(err.message);
      console.error('Ошибка входа через Google:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isRegister ? 'Регистрация' : 'Вход в систему'}</CardTitle>
        <CardDescription>
          {isRegister 
            ? 'Создайте новую учетную запись для доступа к OKUUM.AI' 
            : 'Войдите в свою учетную запись OKUUM.AI'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Имя
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите ваше имя"
                required={isRegister}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите ваш email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Пароль
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите ваш пароль"
              required
            />
          </div>
          
          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Загрузка...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
          </Button>
        </form>
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'hsl(var(--border))' }}></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Или</span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          type="button" 
          className="w-full" 
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Войти через Google
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShadcnAuthForm;
