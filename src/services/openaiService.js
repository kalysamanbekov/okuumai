/**
 * Сервис для интеграции с OpenAI API
 * Обеспечивает прямое взаимодействие с OpenAI без промежуточных прокси
 */

import OpenAI from 'openai';

// Конфигурация API
const OPENAI_MODEL = 'gpt-4o'; // Можно изменить на gpt-3.5-turbo для снижения стоимости
const API_TIMEOUT = 30000; // 30 секунд таймаут для запросов

// Инициализация OpenAI клиента
const initializeOpenAI = () => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('OpenAI API key не найден! Убедитесь, что в файле .env установлена переменная REACT_APP_OPENAI_API_KEY');
    return null;
  }
  
  try {
    return new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Необходимо для работы в браузере
      timeout: API_TIMEOUT
    });
  } catch (error) {
    console.error('Ошибка инициализации OpenAI клиента:', error);
    return null;
  }
};

// Создаем экземпляр OpenAI клиента
const openaiClient = initializeOpenAI();

/**
 * Отправляет запрос к OpenAI Chat Completions API
 * @param {Array} messages - Массив сообщений для API в формате [{role: 'user', content: 'текст'}]
 * @returns {Promise<string>} - Текст ответа от API или сообщение об ошибке
 */
export const getChatCompletion = async (messages) => {
  try {
    console.log('Отправка запроса через локальный прокси сервер');
    console.log('Количество сообщений:', messages.length);
    
    // Проверка на пустые сообщения
    if (!messages || messages.length === 0) {
      throw new Error('Нет сообщений для отправки в API');
    }
    
    // Определяем URL в зависимости от окружения
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? '/api/chat'
      : 'http://localhost:3008/api/chat';
    
    console.log('Используем URL:', apiUrl);
    
    // Отправляем запрос через fetch API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: messages
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка API:', errorText);
      throw new Error(`Запрос завершился с ошибкой: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Ответ получен:', data);
    
    if (data.choices && data.choices.length > 0) {
      const messageContent = data.choices[0].message.content;
      console.log('Получен ответ от OpenAI API:', messageContent.substring(0, 50) + '...');
      return messageContent;
    } else {
      throw new Error('Неожиданный формат ответа');
    }
  } catch (error) {
    // Детальная обработка ошибок
    console.error('Ошибка при вызове OpenAI API:', error);
    
    // Анализ типа ошибки для лучшего сообщения пользователю
    if (error.status === 429) {
      return 'Превышен лимит запросов к API. Пожалуйста, попробуйте позже.';
    } else if (error.status === 401) {
      return 'Ошибка авторизации. Проверьте API ключ.';
    } else if (error.status === 500) {
      return 'Ошибка на стороне сервера OpenAI. Попробуйте позже.';
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'Превышено время ожидания ответа от API. Попробуйте позже.';
    }
    
    return `Ошибка при обращении к API: ${error.message}`;
  }
};

/**
 * Преобразует сообщения из формата приложения в формат API OpenAI
 * @param {Array} messagesArray - Массив сообщений в формате приложения
 * @returns {Array} - Массив сообщений в формате OpenAI API
 */
export const formatMessagesForAPI = (messagesArray) => {
  if (!messagesArray || !Array.isArray(messagesArray)) {
    console.error('Некорректный формат сообщений:', messagesArray);
    return [];
  }
  
  return messagesArray.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text || ''
  }));
};
