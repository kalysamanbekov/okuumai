const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

// Демо-данные для имитации ответов чата
const DEMO_RESPONSES = [
  'Привет! Я демо-версия ассистента OKUUM.AI. Я могу помочь вам с подготовкой к экзаменам.',
  'Это демонстрационный режим интерфейса. API OpenAI не используется.',
  'В полной версии я могу отвечать на вопросы по математике, логике и другим предметам.',
  'Shadcn/UI предоставляет красивые и доступные компоненты для React приложений.',
  'Вы можете настроить тему оформления с помощью кнопки в правом верхнем углу.'
];

// Счетчик для циклического перебора демо-ответов
let responseIndex = 0;

// Инициализация приложения Express
const app = express();
const PORT = process.env.PORT || 3009;

// Настройка CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Логирование HTTP запросов
app.use(morgan('dev'));

// Парсинг JSON в теле запроса
app.use(express.json());

// Обслуживание статических файлов из директории public
app.use(express.static(path.join(__dirname, 'public')));

// Тестовый маршрут для проверки работы сервера
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running in demo mode', time: new Date().toISOString() });
});

// Демо-endpoint для имитации чата без использования OpenAI API
app.post('/chat', (req, res) => {
  console.log('Получен запрос к /chat в демо-режиме');

  try {
    const { message } = req.body;
    console.log(`Сообщение пользователя: ${message ? message.substring(0, 50) : 'не указано'}...`);
    
    // Получаем демо-ответ и увеличиваем индекс для следующего запроса
    const reply = DEMO_RESPONSES[responseIndex];
    responseIndex = (responseIndex + 1) % DEMO_RESPONSES.length;
    
    // Имитируем задержку для реалистичности
    setTimeout(() => {
      res.json({ reply });
    }, 500);
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error.message });
  }
});

// Демо-endpoint для имитации API чата без использования OpenAI API
app.post('/api/chat', (req, res) => {
  console.log('Получен запрос к /api/chat в демо-режиме');

  try {
    // Получаем демо-ответ и увеличиваем индекс для следующего запроса
    const reply = DEMO_RESPONSES[responseIndex];
    responseIndex = (responseIndex + 1) % DEMO_RESPONSES.length;
    
    // Имитируем задержку для реалистичности
    setTimeout(() => {
      res.json({ 
        message: {
          role: 'assistant',
          content: reply
        },
        id: 'demo-id-' + Date.now(),
        model: 'demo-model',
        usage: { total_tokens: 0 }
      });
    }, 500);
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error.message });
  }
});

// Обработка всех остальных маршрутов - отправляем index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Демо-сервер запущен на порту ${PORT}`);
  console.log(`Откройте http://localhost:${PORT} в вашем браузере`);
});
