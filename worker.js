// Cloudflare Worker для проксирования запросов к OpenAI API

export default {
  async fetch(request, env) {
    // Проверка на CORS preflight запрос
    if (request.method === 'OPTIONS') {
      return handleCors();
    }

    // Обрабатываем только POST запросы к /api/chat
    if (request.method === 'POST' && new URL(request.url).pathname === '/api/chat') {
      try {
        // Получаем тело запроса
        const requestData = await request.json();
        
        // Создаем запрос к OpenAI API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: requestData.messages
          })
        });
        
        // Получаем ответ от OpenAI
        const data = await openaiResponse.json();
        
        // Возвращаем ответ с нужными CORS заголовками
        return new Response(JSON.stringify(data), {
          headers: corsHeaders('application/json')
        });
      } catch (error) {
        // Обработка ошибок
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: corsHeaders('application/json')
        });
      }
    }
    
    // Для всех остальных запросов возвращаем 404
    return new Response('Not Found', { status: 404 });
  }
};

// Функция для добавления CORS заголовков
function corsHeaders(contentType) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': contentType || 'text/plain'
  };
}

// Обработка CORS preflight запросов
function handleCors() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}
