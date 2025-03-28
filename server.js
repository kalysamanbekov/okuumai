const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const { OpenAI } = require('openai');
require('dotenv').config();

// Проверяем наличие API-ключа
let demoMode = false;
if (!process.env.OPENAI_API_KEY) {
  console.warn('Внимание: OPENAI_API_KEY не найден в переменных окружения');
  console.warn('Запуск в демо-режиме с предопределенными ответами');
  demoMode = true;
  // Не завершаем процесс, продолжаем в демо-режиме
}

// Инициализация OpenAI (если есть ключ API)
let openai = null;
if (!demoMode) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Маппинг material_id к assistant_id
const ASSISTANTS_MAP = {
  'test_full': 'asst_NDIJTricZzQXUHcRH01NRoLW',      // Пробное тестирование
  'trainer_math1': 'asst_7od30lZQMDMo6xTbVZ9yUZ0K',   // Математика 1
  'trainer_math2': 'asst_k4AUnwgcryTCBzX3W4EPH3ee',   // Математика 2
  'trainer_analogies': 'asst_wOilQhPJD7czTvXoAfAlX0Wa', // Аналогии и дополнения
  'trainer_reading': 'asst_PcxUJ4NlKDvFxpw8iqydcSj9'   // Чтение и понимание
};

// Хранилище для thread_id пользователей (в реальном приложении следует использовать базу данных)
const userThreads = {};

// Инициализация приложения Express
const app = express();
const PORT = process.env.PORT || 3010;

// Улучшенная настройка CORS
app.use(cors({
  origin: '*', // Разрешаем запросы с любых источников для тестирования
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: ['Content-Type', 'Content-Length', 'Content-Encoding'] // Добавляем заголовки для SSE
}));

// Настраиваем дополнительные CORS-заголовки для всех ответов
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Expose-Headers', 'Content-Type, Content-Length, Content-Encoding'); // Добавляем для SSE
  
  // Отключаем буферизацию для потоковых запросов
  if (req.url.includes('/api/chat/stream')) {
    res.flushHeaders();
  }
  
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

// Новый эндпоинт для потоковой передачи ответов от OpenAI API (поддерживает POST и GET)
app.all('/api/chat/stream', async (req, res) => {
  console.log('Получен запрос к /api/chat/stream');
  
  // Настраиваем заголовки для потоковой передачи
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Отключаем буферизацию для Nginx
  
  // Отключаем буферизацию ответа
  res.flushHeaders();
  
  // Проверка наличия API ключа
  if (demoMode) {
    console.warn('Запуск потокового API в демо-режиме');
    // Отправляем имитацию потоковой передачи в демо-режиме
    const demoResponse = 'Это демонстрационный ответ, имитирующий потоковую передачу данных от OpenAI API. '
      + 'В реальном режиме вы будете видеть, как ответ появляется постепенно, символ за символом, '
      + 'что создаст эффект общения с реальным человеком.';
    
    // Отправляем ответ по частям для имитации потоковой передачи
    const words = demoResponse.split(' ');
    
    for (const word of words) {
      res.write(`data: ${JSON.stringify({ chunk: word + ' ' })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 100)); // Задержка для имитации
    }
    
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
  }

  // Получаем данные из запроса (поддерживаем как POST, так и GET)
  let messages = [];
  
  if (req.method === 'GET') {
    // Получаем данные из URL-параметра 'data'
    try {
      if (req.query.data) {
        const data = JSON.parse(req.query.data);
        if (data.messages && Array.isArray(data.messages)) {
          messages = data.messages;
        } else {
          throw new Error('Неверный формат данных');
        }
      } else {
        throw new Error('Отсутствует параметр data');
      }
    } catch (error) {
      console.error('Ошибка при обработке GET-параметров:', error.message);
      res.write(`data: ${JSON.stringify({ error: `Ошибка в формате запроса: ${error.message}` })}\n\n`);
      return res.end();
    }
  } else if (req.method === 'POST') {
    // Получаем данные из тела POST-запроса
    if (!req.body.messages || !Array.isArray(req.body.messages)) {
      console.error('Ошибка в формате POST-запроса');
      res.write(`data: ${JSON.stringify({ error: 'Ошибка в формате запроса' })}\n\n`);
      return res.end();
    }
    messages = req.body.messages;
  } else {
    // Неподдерживаемый метод
    res.write(`data: ${JSON.stringify({ error: `Метод ${req.method} не поддерживается` })}\n\n`);
    return res.end();
  }
  
  // Проверка наличия сообщений
  if (!messages.length) {
    console.error('Отсутствуют сообщения в запросе');
    res.write(`data: ${JSON.stringify({ error: 'Отсутствуют сообщения в запросе' })}\n\n`);
    return res.end();
  }
  
  try {
    console.log('Подготовка потокового запроса к OpenAI API...');
    // Добавляем системное сообщение, если его нет
    const processedMessages = [...messages];
    const hasSystemMessage = processedMessages.some(msg => msg.role === 'system');
    
    if (!hasSystemMessage) {
      processedMessages.unshift({
        role: 'system',
        content: 'Вы - полезный ассистент по образованию, который помогает учащимся готовиться к экзаменам ОРТ. Давайте точные и информативные ответы по учебным предметам.'
      });
    }
    
    // Создаем поток от OpenAI API
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: processedMessages,
      stream: true,
      temperature: 0.7,
    });
    
    // Обрабатываем поток данных и отправляем клиенту
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        console.log('Отправка фрагмента клиенту:', content);
        
        // Добавляем проверку на наличие Markdown-символов
        const hasMarkdown = /[\*#\[\]_`>\-]/.test(content);
        if (hasMarkdown) {
          console.log('Обнаружены Markdown-символы в фрагменте:', content);
        }
        
        res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
        // Принудительная отправка данных клиенту
        res.flush();
      }
    }
    
    // Сигнализируем о завершении потока
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Ошибка OpenAI API при потоковой передаче:', error.message);
    res.write(`data: ${JSON.stringify({ error: `Ошибка OpenAI API: ${error.message}` })}\n\n`);
    res.end();
  }
});

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
    const processedMessages = [...messages];
    const hasSystemMessage = processedMessages.some(msg => msg.role === 'system');
    
    if (!hasSystemMessage) {
      processedMessages.unshift({
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

// Модуль для работы с OpenAI Assistant API
const assistantModule = {
  // Получение assistant_id по material_id
  getAssistantId: (materialId) => {
    const assistantId = ASSISTANTS_MAP[materialId];
    if (!assistantId) {
      throw new Error(`Неизвестный material_id: ${materialId}`);
    }
    return assistantId;
  },
  
  // Получение или создание thread для пользователя
  getOrCreateThread: async (userId, materialId) => {
    // Используем комбинацию userId и materialId как ключ
    // чтобы у каждого пользователя был отдельный thread для каждого типа материала
    const threadKey = `${userId}_${materialId}`;
    
    if (!userThreads[threadKey]) {
      console.log(`Создание нового thread для пользователя ${userId} и материала ${materialId}`);
      const thread = await openai.beta.threads.create();
      userThreads[threadKey] = thread.id;
      console.log('Создан новый thread:', thread.id);
    }
    
    return userThreads[threadKey];
  },
  
  // Добавление сообщения пользователя в thread
  addUserMessage: async (threadId, message) => {
    return await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message
    });
  },
  
  // Запуск run с определенным assistant_id
  runAssistant: async (threadId, assistantId) => {
    console.log(`[DEBUG] Отправка запроса к ассистенту с ID: ${assistantId}`);
    return await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });
  },
  
  // Ожидание завершения run
  waitForRunCompletion: async (threadId, runId) => {
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    
    // Проверяем статус каждые 500 мс
    while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 500));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
      console.log('Статус выполнения:', runStatus.status);
    }
    
    return runStatus;
  },
  
  // Получение последнего ответа ассистента
  getLatestAssistantReply: async (threadId) => {
    const messages = await openai.beta.threads.messages.list(threadId);
    
    // Находим последнее сообщение от ассистента
    const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
    
    if (assistantMessages.length === 0) {
      throw new Error('Не удалось получить ответ от ассистента');
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
    
    return replyText || 'Ассистент не предоставил текстового ответа';
  }
};

// Новый endpoint для работы с OpenAI Assistant API на основе material_id
app.post('/chat', async (req, res) => {
  console.log('Получен запрос к /chat');
  
  // Проверка наличия API ключа
  if (!process.env.OPENAI_API_KEY) {
    console.error('ОШИБКА: OPENAI_API_KEY отсутствует');
    return res.status(500).json({ reply: 'Ошибка сервера: API ключ отсутствует' });
  }

  // Проверка наличия необходимых полей в запросе
  if (!req.body.message || typeof req.body.message !== 'string') {
    console.error('Ошибка в формате запроса: отсутствует поле message');
    return res.status(400).json({ reply: 'Ошибка в формате запроса: отсутствует поле message' });
  }
  
  if (!req.body.material_id || typeof req.body.material_id !== 'string') {
    console.error('Ошибка в формате запроса: отсутствует поле material_id');
    return res.status(400).json({ reply: 'Ошибка в формате запроса: отсутствует поле material_id' });
  }
  
  try {
    // Получаем данные из запроса
    const { message, material_id } = req.body;
    console.log(`Сообщение пользователя для материала ${material_id}:`, message);
    
    // Получаем assistant_id по material_id
    let assistantId;
    try {
      assistantId = assistantModule.getAssistantId(material_id);
      console.log(`Используем ассистента ${assistantId} для материала ${material_id}`);
      
      // Дополнительная проверка наличия assistant_id в ASSISTANTS_MAP
      if (!ASSISTANTS_MAP[material_id]) {
        throw new Error(`Материал с ID ${material_id} не найден в ASSISTANTS_MAP`);
      }
      
      // Проверка соответствия полученного assistant_id и значения из ASSISTANTS_MAP
      if (assistantId !== ASSISTANTS_MAP[material_id]) {
        console.warn(`[ПРЕДУПРЕЖДЕНИЕ] Несоответствие assistant_id: получено ${assistantId}, ожидалось ${ASSISTANTS_MAP[material_id]}`);
      }
    } catch (error) {
      console.error(error.message);
      return res.status(400).json({ reply: error.message });
    }
    
    // Получаем ID пользователя (в реальном приложении лучше использовать авторизацию)
    const userId = req.ip || req.socket.remoteAddress;
    
    // Получаем или создаем thread для пользователя и выбранного материала
    const threadId = await assistantModule.getOrCreateThread(userId, material_id);
    console.log(`Используем thread ${threadId} для пользователя ${userId} и материала ${material_id}`);
    
    // Добавляем сообщение пользователя в thread
    await assistantModule.addUserMessage(threadId, message);
    
    // Запускаем run с выбранным assistant_id
    const run = await assistantModule.runAssistant(threadId, assistantId);
    
    // Ожидаем завершения run
    const runStatus = await assistantModule.waitForRunCompletion(threadId, run.id);
    
    if (runStatus.status === 'failed') {
      console.error('Ошибка выполнения:', runStatus.last_error);
      return res.status(500).json({ reply: 'Ошибка при обработке запроса ассистентом' });
    }
    
    // Получаем ответ от ассистента
    const replyText = await assistantModule.getLatestAssistantReply(threadId);
    
    // Отправляем ответ клиенту
    res.json({ reply: replyText });
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
