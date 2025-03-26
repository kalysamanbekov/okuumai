const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const { OpenAI } = require('openai');
require('dotenv').config();

// Проверяем наличие API-ключа
if (!process.env.OPENAI_API_KEY) {
  console.error('Ошибка: OPENAI_API_KEY не найден в переменных окружения');
  console.error('Создайте файл .env в корневой директории с содержимым: OPENAI_API_KEY=ваш_ключ');
  process.exit(1);
}

// Инициализация OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ID ассистента OpenAI
const ASSISTANT_ID = process.env.ASSISTANT_ID || 'asst_uKuVLbdzuKS3kmKGf47qQVcF';

// Хранилище для thread_id пользователей (в реальном приложении следует использовать базу данных)
const userThreads = {};

// Инициализация приложения Express
const app = express();
const PORT = process.env.PORT || 3008;

// Улучшенная настройка CORS
app.use(cors({
  origin: '*', // Разрешаем запросы с любых источников для тестирования
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Настраиваем дополнительные CORS-заголовки для всех ответов
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  // Логирование запросов для отладки
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  next();
});

// Логирование HTTP запросов
app.use(morgan('dev'));

// Парсинг JSON в теле запроса
app.use(express.json());

// Обслуживание статических файлов из директории public
app.use(express.static(path.join(__dirname, 'public')));

// Тестовый маршрут для проверки работы сервера
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running', time: new Date().toISOString() });
});

// Основной маршрут для обработки запросов чата через OpenAI API
// Простой тестовый маршрут, который сразу возвращает ответ без вызова OpenAI
// ВАЖНО: Этот маршрут должен быть определен до остальных маршрутов
app.post('/api/test-chat', (req, res) => {
  console.log('Получен тестовый запрос к /api/test-chat');
  // Отправляем более простой ответ для тестирования
  return res.json({
    message: {
      role: 'assistant',
      content: 'Это тестовый ответ от сервера без вызова OpenAI API. Если вы видите это сообщение, значит соединение работает правильно.'
    },
    id: 'test-id',
    model: 'test-model',
    usage: { total_tokens: 0 }
  });
});

// Также добавим GET-версию для тестирования через браузер напрямую
app.get('/api/test-chat', (req, res) => {
  console.log('Получен GET-запрос к /api/test-chat');
  return res.json({
    message: {
      role: 'assistant',
      content: 'Это тестовый GET-ответ. API работает.'
    }
  });
});

// Основной маршрут для обработки запросов чата с заготовленным ответом,
// если OpenAI API недоступен
// Существующий endpoint для совместимости с предыдущей версией
app.post('/api/chat', async (req, res) => {
  console.log('Получен запрос к /api/chat');
  
  // Упрощаем логирование, чтобы не перегружать логи
  console.log('Тип запроса:', req.body && Array.isArray(req.body.messages) 
    ? `Сообщений: ${req.body.messages.length}` 
    : 'Некорректный формат');
  
  // Подготовим резервный ответ на случай ошибки
  const fallbackResponse = {
    message: {
      role: 'assistant',
      content: 'Извините, в данный момент я не могу обработать ваш запрос. Пожалуйста, попробуйте позже или обратитесь к преподавателю.'
    },
    id: 'fallback-response',
    model: 'fallback-model',
    usage: { total_tokens: 20 }
  };
  
  // Проверка наличия API ключа
  if (!process.env.OPENAI_API_KEY) {
    console.error('ОШИБКА: OPENAI_API_KEY отсутствует');
    return res.json(fallbackResponse); // Используем запасной ответ вместо ошибки
  }

  // Проверка наличия сообщений в запросе
  if (!req.body.messages || !Array.isArray(req.body.messages)) {
    console.error('Ошибка в формате запроса');
    return res.json(fallbackResponse); // Используем запасной ответ вместо ошибки
  }
  
  try {
    console.log('Подготовка запроса к OpenAI API...');
    // Добавляем системное сообщение, если его нет
    const messages = [...req.body.messages];
    const hasSystemMessage = messages.some(msg => msg.role === 'system');
    
    if (!hasSystemMessage) {
      messages.unshift({
        role: 'system',
        content: 'Вы - полезный ассистент по образованию, который помогает учащимся готовиться к экзаменам ОРТ. Давайте точные и информативные ответы по учебным предметам.'
      });
    }
    
    // Ограничиваем количество маркеров для уменьшения нагрузки
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 300, // Уменьшаем лимит токенов
      temperature: 0.7,
    });
    
    // Отправляем упрощенный ответ клиенту
    res.json({
      message: response.choices[0].message,
      id: response.id,
      model: response.model,
      usage: response.usage
    });
  } catch (error) {
    console.error('Ошибка OpenAI API:', error.message);
    
    // Вместо отправки ошибки, отправляем запасной ответ
    // чтобы клиент мог продолжать работу
    res.json(fallbackResponse);
  }
});

// Новый endpoint для работы с OpenAI Assistant API
app.post('/chat', async (req, res) => {
  console.log('Получен запрос к /chat');
  
  // Проверка наличия API ключа
  if (!process.env.OPENAI_API_KEY) {
    console.error('ОШИБКА: OPENAI_API_KEY отсутствует');
    return res.status(500).json({ reply: 'Ошибка сервера: API ключ отсутствует' });
  }

  // Проверка наличия сообщения в запросе
  if (!req.body.message || typeof req.body.message !== 'string') {
    console.error('Ошибка в формате запроса: отсутствует поле message');
    return res.status(400).json({ reply: 'Ошибка в формате запроса: отсутствует поле message' });
  }
  
  try {
    // Получаем сообщение пользователя
    const userMessage = req.body.message;
    console.log('Сообщение пользователя:', userMessage);
    
    // Получаем IP пользователя для идентификации (в реальном приложении лучше использовать авторизацию)
    const userIP = req.ip || req.socket.remoteAddress;
    
    // Проверяем, есть ли у пользователя уже созданный thread
    if (!userThreads[userIP]) {
      console.log('Создание нового thread для пользователя');
      // Создаем новый thread для пользователя
      const thread = await openai.beta.threads.create();
      userThreads[userIP] = thread.id;
      console.log('Создан новый thread:', thread.id);
    }
    
    const threadId = userThreads[userIP];
    console.log('Используем thread:', threadId);
    
    // Добавляем сообщение пользователя в thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: userMessage
    });
    
    // Запускаем run с assistant_id
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID
    });
    
    // Ожидаем завершения run
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    
    // Проверяем статус каждые 500 мс
    while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 500));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      console.log('Статус выполнения:', runStatus.status);
    }
    
    if (runStatus.status === 'failed') {
      console.error('Ошибка выполнения:', runStatus.last_error);
      return res.status(500).json({ reply: 'Ошибка при обработке запроса ассистентом' });
    }
    
    // Получаем ответ от ассистента
    const messages = await openai.beta.threads.messages.list(threadId);
    
    // Находим последнее сообщение от ассистента
    const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
    
    if (assistantMessages.length === 0) {
      return res.status(500).json({ reply: 'Не удалось получить ответ от ассистента' });
    }
    
    // Берем самое последнее сообщение от ассистента
    const latestMessage = assistantMessages[0];
    
    // Извлекаем текст сообщения
    let replyText = '';
    if (latestMessage.content && latestMessage.content.length > 0) {
      const textContent = latestMessage.content.filter(content => content.type === 'text');
      if (textContent.length > 0) {
        replyText = textContent[0].text.value;
      }
    }
    
    // Отправляем ответ клиенту
    res.json({ reply: replyText || 'Ассистент не предоставил текстового ответа' });
  } catch (error) {
    console.error('Ошибка при работе с OpenAI Assistant API:', error.message);
    res.status(500).json({ reply: 'Произошла ошибка при обработке запроса' });
  }
});

// Создаем эндпоинт для CORS-перехватчика
app.get('/fix-cors.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.send(`
    // Скрипт для перехвата запросов к localhost и перенаправления их на текущий домен
    (function() {
      console.log('CORS-исправление активировано!');
      
      // Сохраняем оригинальный fetch
      const originalFetch = window.fetch;
      
      // Переопределяем fetch для перехвата запросов
      window.fetch = function(url, options) {
        // Проверяем, содержит ли URL localhost:3008
        if (typeof url === 'string' && url.includes('localhost:3008')) {
          console.log('Перехват запроса к:', url);
          
          // Заменяем localhost:3008 на текущий домен
          const currentOrigin = window.location.origin;
          const newUrl = url.replace('http://localhost:3008', currentOrigin);
          
          console.log('Перенаправление на:', newUrl);
          return originalFetch(newUrl, options);
        }
        
        // Для остальных запросов используем оригинальный fetch
        return originalFetch(url, options);
      };
    })();
  `);
});

// Инжектируем наш скрипт во все HTML-ответы
app.use((req, res, next) => {
  // Проверяем только запросы к HTML-страницам
  if (req.path === '/' || req.path.endsWith('.html')) {
    const originalSend = res.send;
    
    res.send = function(body) {
      // Если это HTML-страница
      if (typeof body === 'string' && body.includes('<head>')) {
        // Добавляем наш скрипт для исправления CORS
        const fixScript = '<script src="/fix-cors.js"></script>';
        body = body.replace('<head>', `<head>\n    ${fixScript}`);
      }
      
      return originalSend.call(this, body);
    };
  }
  
  next();
});

// Добавляем специальный API-эндпоинт для запросов непосредственно к localhost:3008
app.all('/proxy-localhost*', (req, res) => {
  const target = req.url.replace('/proxy-localhost', '');
  console.log(`Получен запрос через прокси: ${target}`);
  
  if (target.includes('/api/chat')) {
    // Перенаправляем запрос на наш API-endpoint
    req.url = '/api/chat';
    return app._router.handle(req, res);
  }
  
  res.status(404).json({ error: 'URL not supported for proxying' });
});

// Перенаправление всех остальных запросов на React-приложение
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
