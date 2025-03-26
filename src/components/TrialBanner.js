import React, { useState, useEffect } from 'react';
import { auth, checkTrialStatus } from '../firebase';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const TrialBanner = () => {
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
      <div className={cn(
        "p-4 rounded-lg shadow-md bg-primary/10 border border-primary/30 max-w-xl mx-auto my-4",
        "flex flex-col items-center text-center space-y-3"
      )}>
        <h3 className="text-xl font-semibold text-primary">Добро пожаловать в ОРТ Тренажёр!</h3>
        <p className="text-muted-foreground">У вас есть доступ ко всем пробным тестам в течение 24 часов</p>
        <div className="font-mono text-lg font-medium bg-primary/5 px-4 py-2 rounded-md">
          Осталось времени: <span className="text-primary">{formatTimeRemaining(trialStatus.timeRemaining)}</span>
        </div>
        <Button 
          onClick={() => window.location.href = '/tests'}
          className="mt-2"
        >
          Перейти к тестам
        </Button>
      </div>
    );
  }
  
  // Если триал истёк, показываем баннер с предложением купить доступ
  return (
    <div className={cn(
      "p-4 rounded-lg shadow-md bg-destructive/10 border border-destructive/30 max-w-xl mx-auto my-4",
      "flex flex-col items-center text-center space-y-3"
    )}>
      <h3 className="text-xl font-semibold text-destructive">Пробный доступ завершён</h3>
      <p className="text-muted-foreground">Активируйте полный доступ к тренажёру!</p>
      <Button 
        variant="secondary"
        onClick={() => window.location.href = '/payment'}
      >
        Купить доступ за 890 сом
      </Button>
    </div>
  );
};

export default TrialBanner;
