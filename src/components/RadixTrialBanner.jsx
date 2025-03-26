import React, { useState, useEffect } from 'react';
import { auth, checkTrialStatus } from '../firebase';
import { Box, Flex, Text, Heading, Button, Card, Badge } from '@radix-ui/themes';

const RadixTrialBanner = () => {
  const [trialStatus, setTrialStatus] = useState({
    isActive: false,
    timeRemaining: 0,
    loading: true,
    error: null
  });
  
  // Форматирование оставшегося времени в формат ЧЧ:ММ:СС
  const formatTimeRemaining = (milliseconds) => {
    if (milliseconds <= 0) return '00:00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Получение статуса триала
  useEffect(() => {
    const fetchTrialStatus = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        setTrialStatus(prev => ({ ...prev, loading: false }));
        return;
      }
      
      try {
        // Получаем данные о триале из обновленной функции checkTrialStatus
        const { trialActive, timeLeft, formattedTimeLeft, error } = await checkTrialStatus(user.uid);
        
        console.log('Получены данные о триале:', { trialActive, timeLeft, formattedTimeLeft });
        
        setTrialStatus({
          isActive: trialActive,
          timeRemaining: timeLeft, // Теперь это время в миллисекундах
          loading: false,
          error
        });
      } catch (error) {
        setTrialStatus({
          isActive: false,
          timeRemaining: 0,
          loading: false,
          error: error.message
        });
      }
    };
    
    fetchTrialStatus();
    
    // Обновляем статус триала каждую минуту
    const intervalId = setInterval(fetchTrialStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Обновление таймера каждую секунду
  useEffect(() => {
    if (!trialStatus.isActive || trialStatus.loading) return;
    
    const timerId = setInterval(() => {
      setTrialStatus(prev => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1000)
      }));
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [trialStatus.isActive, trialStatus.loading]);
  
  // Если данные загружаются или пользователь не авторизован, не показываем баннер
  if (trialStatus.loading || !auth.currentUser) {
    return null;
  }
  
  // Если триал активен, показываем баннер с таймером
  if (trialStatus.isActive) {
    return (
      <Box mx="auto" my="4" style={{ maxWidth: '36rem' }}>
        <Card>
          <Flex direction="column" align="center" gap="3" p="4">
            <Heading as="h3" size="4" color="orange" align="center">
              Ваш пробный доступ активен!
            </Heading>
            <Text color="gray" align="center">
              У вас всего 24 часа, чтобы попробовать ИИ-тренажёр для подготовки к ОРТ. Используйте это время эффективно и улучшите свои результаты.
            </Text>
            <Box p="2" style={{ background: 'rgba(255, 153, 0, 0.1)', borderRadius: '8px' }}>
              <Text as="div" align="center">
                Осталось времени: <Badge color="orange" size="2">{formatTimeRemaining(trialStatus.timeRemaining)}</Badge>
              </Text>
            </Box>
            <Button color="orange" onClick={() => window.location.href = '/tests'}>
              Продлить доступ
            </Button>
          </Flex>
        </Card>
      </Box>
    );
  }
  
  // Если триал истёк, показываем баннер с предложением купить доступ
  return (
    <Box mx="auto" my="4" style={{ maxWidth: '36rem' }}>
      <Card>
        <Flex direction="column" align="center" gap="3" p="4">
          <Heading as="h3" size="4" color="red" align="center">
            Пробный доступ завершён
          </Heading>
          <Text color="gray" align="center">
            Активируйте полный доступ к тренажёру!
          </Text>
          <Button color="orange" variant="soft" onClick={() => window.location.href = '/payment'}>
            Купить доступ за 890 сом
          </Button>
        </Flex>
      </Card>
    </Box>
  );
};

export default RadixTrialBanner;
