import React, { useState } from 'react';
import { Box, Flex, Text, Heading, Button, Card, TextField, Separator } from '@radix-ui/themes';
import { auth, loginWithEmailAndPassword, registerWithEmailAndPassword, signInWithGoogle } from '../firebase';

const RadixAuthForm = ({ onAuthSuccess }) => {
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
    <Card size="3" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <Flex direction="column" gap="4" p="4">
        <Box>
          <Heading size="5" mb="1">{isRegister ? 'Регистрация' : 'Вход в систему'}</Heading>
          <Text color="gray" size="2">
            {isRegister 
              ? 'Создайте новую учетную запись для доступа к OKUUM.AI' 
              : 'Войдите в свою учетную запись OKUUM.AI'}
          </Text>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="3">
            {isRegister && (
              <Box>
                <Text as="label" size="2" mb="1" weight="medium">Имя</Text>
                <TextField.Root>
                  <TextField.Input 
                    placeholder="Введите ваше имя" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required={isRegister}
                  />
                </TextField.Root>
              </Box>
            )}
            
            <Box>
              <Text as="label" size="2" mb="1" weight="medium">Email</Text>
              <TextField.Root>
                <TextField.Input 
                  type="email" 
                  placeholder="Введите ваш email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </TextField.Root>
            </Box>
            
            <Box>
              <Text as="label" size="2" mb="1" weight="medium">Пароль</Text>
              <TextField.Root>
                <TextField.Input 
                  type="password" 
                  placeholder="Введите ваш пароль" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </TextField.Root>
            </Box>
            
            {error && (
              <Box p="3" style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', borderRadius: '6px' }}>
                <Text color="red" size="2">{error}</Text>
              </Box>
            )}
            
            <Button type="submit" disabled={loading} color="orange">
              {loading ? 'Загрузка...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
            </Button>
          </Flex>
        </form>
        
        <Flex align="center" gap="3">
          <Separator size="4" />
          <Text size="1" color="gray">ИЛИ</Text>
          <Separator size="4" />
        </Flex>
        
        <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading}>
          <Flex gap="2" align="center" justify="center">
            <svg width="16" height="16" viewBox="0 0 24 24">
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
            <Text>Войти через Google</Text>
          </Flex>
        </Button>
        
        <Box>
          <Button variant="ghost" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </Button>
        </Box>
      </Flex>
    </Card>
  );
};

export default RadixAuthForm;
