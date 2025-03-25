import React, { useState, useEffect } from 'react';
import './styles/App.css';
import './styles/global.css';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';

// u0423u043fu0440u043eu0449u0435u043du043du044bu0439 u043au043eu043cu043fu043eu043du0435u043du0442 u0441u043eu043eu0431u0449u0435u043du0438u044f u0447u0430u0442u0430
const ChatMessage = ({ sender, content }) => {
  return (
    <div className={`message ${sender}`}>
      <div className="avatar">
        {sender === 'user' ? 'U' : 'A'}
      </div>
      <div className="content">
        {content}
      </div>
    </div>
  );
};

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // u0418u043du0438u0446u0438u0430u043bu0438u0437u0430u0446u0438u044f u0447u0430u0442u0430 u0441 u043fu0440u0438u0432u0435u0442u0441u0442u0432u0435u043du043du044bu043c u0441u043eu043eu0431u0449u0435u043du0438u0435u043c
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: 'assistant',
          content: 'u041fu0440u0438u0432u0435u0442! u042f u0447u0430u0442-u0431u043eu0442 u043du0430 u043eu0441u043du043eu0432u0435 OpenAI API. u0427u0435u043c u044f u043cu043eu0433u0443 u043fu043eu043cu043eu0447u044c u0432u0430u043c u0441u0435u0433u043eu0434u043du044f?'
        }
      ]);
    }
    
    // u041fu0440u043eu043au0440u0443u0442u043au0430 u0447u0430u0442u0430 u0432u043du0438u0437 u043fu0440u0438 u0434u043eu0431u0430u0432u043bu0435u043du0438u0438 u043du043eu0432u044bu0445 u0441u043eu043eu0431u0449u0435u043du0438u0439
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }, [messages]);

  // Проверка и исправление URL, чтобы использовать бэкенд на Render
  const fixApiUrl = (url) => {
    // Если URL содержит localhost, заменяем на Render URL
    if (typeof url === 'string' && url.includes('localhost:3008')) {
      console.log('Заменяем localhost:3008 на бэкенд Render');
      // Используем постоянный URL на Render
      return url.replace('http://localhost:3008', 'https://ort-ai-chat-backend.onrender.com');
    }
    return url;
  };

  // Создаем CORS-безопасный fetch с приоритетом использования Render
  const safeFetch = async (url, options = {}) => {
    // Всегда пытаемся сначала использовать Render бэкенд
    try {
      const renderUrl = 'https://ort-ai-chat-backend.onrender.com/api/chat';
      console.log(`Пытаемся выполнить запрос к Render: ${renderUrl}`);
      
      const response = await fetch(renderUrl, options);
      return response;
    } catch (error) {
      console.warn(`Ошибка при запросе к Render: ${error.message}`);
      
      // Запасной вариант - используем исправленный URL
      try {
        const fixedUrl = fixApiUrl(url);
        console.log(`Пробуем запасной вариант: ${fixedUrl}`);
        
        const backupResponse = await fetch(fixedUrl, options);
        return backupResponse;
      } catch (backupError) {
        console.error('Ошибка при использовании запасного варианта:', backupError);
        throw backupError;
      }
    }
  }
  };

  // u041eu0442u043fu0440u0430u0432u043au0430 u0441u043eu043eu0431u0449u0435u043du0438u044f u0438 u043fu043eu043bu0443u0447u0435u043du0438u0435 u043eu0442u0432u0435u0442u0430 u043eu0442 OpenAI API
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // u0421u043eu0437u0434u0430u0435u043c u0441u043eu043eu0431u0449u0435u043du0438u0435 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f u0432 u0444u043eu0440u043cu0430u0442u0435 OpenAI API
    const userMessage = {
      role: 'user',
      content: newMessage
    };

    // u041eu0442u043eu0431u0440u0430u0436u0430u0435u043c u0441u043eu043eu0431u0449u0435u043du0438u0435 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f u0432 UI
    setMessages(prev => [...prev, {
      sender: 'user',
      content: newMessage
    }]);
    setNewMessage('');
    setIsLoading(true);
    
    try {
      // u0424u043eu0440u043cu0438u0440u0443u0435u043c u0438u0441u0442u043eu0440u0438u044e u0441u043eu043eu0431u0449u0435u043du0438u0439 u0434u043bu044f u043eu0442u043fu0440u0430u0432u043au0438 u0432 OpenAI API
      const apiMessages = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // u0414u043eu0431u0430u0432u043bu044fu0435u043c u043du043eu0432u043eu0435 u0441u043eu043eu0431u0449u0435u043du0438u0435 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f
      apiMessages.push(userMessage);
      
      // u0418u0441u043fu043eu043bu044cu0437u0443u0435u043c u0431u044du043au0435u043du0434 u043du0430 Render u043fu043e u0443u043cu043eu043bu0447u0430u043du0438u044e
      // u042du0442u043e u043fu043eu0437u0432u043eu043bu044fu0435u0442 u0438u0437u0431u0435u0436u0430u0442u044c u043fu0440u043eu0431u043bu0435u043c u0441 CORS u0438 u043bu043eu043au0430u043bu044cu043du044bu043cu0438 u0437u0430u043fu0440u043eu0441u0430u043cu0438
      const apiUrl = 'https://ort-ai-chat-backend.onrender.com/api/chat';
      console.log('u0418u0441u043fu043eu043bu044cu0437u0443u0435u043c Render u0431u044du043au0435u043du0434:', apiUrl);
      
      // u0414u043eu043fu043eu043bu043du0438u0442u0435u043bu044cu043du043e u0437u0430u043fu0438u0441u044bu0432u0430u0435u043c u044du0442u043e u0432 localStorage u0434u043bu044f u0441u043eu0432u043cu0435u0441u0442u0438u043cu043eu0441u0442u0438 u0441 u0434u0440u0443u0433u0438u043cu0438 u0447u0430u0441u0442u044fu043cu0438 u043fu0440u0438u043bu043eu0436u0435u043du0438u044f
      try {
        localStorage.setItem('useDirectApiUrl', 'true');
        localStorage.setItem('fixedApiDomain', 'https://ort-ai-chat-backend.onrender.com');
      } catch (e) {
        console.warn('u041du0435 u0443u0434u0430u043bu043eu0441u044c u0441u043eu0445u0440u0430u043du0438u0442u044c u043du0430u0441u0442u0440u043eu0439u043au0438 u0432 localStorage:', e.message);
      }
      
      console.log('u0418u0442u043eu0433u043eu0432u044bu0439 API URL:', apiUrl);
      console.log('u0421u043eu0434u0435u0440u0436u0438u043cu043eu0435 u0437u0430u043fu0440u043eu0441u0430:', { messages: apiMessages });

      // Используем безопасный fetch вместо обычного
      const response = await safeFetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: apiMessages
        })
      });
      
      console.log('u041fu043eu043bu0443u0447u0435u043d u043eu0442u0432u0435u0442 u0441 u043au043eu0434u043eu043c:', response.status);
      
      if (!response.ok) {
        // u041fu044bu0442u0430u0435u043cu0441u044f u043fu043eu043bu0443u0447u0438u0442u044c u0442u0435u043au0441u0442 u043eu0448u0438u0431u043au0438
        const errorText = await response.text().catch(() => 'u041du0435 u0443u0434u0430u043bu043eu0441u044c u043fu043eu043bu0443u0447u0438u0442u044c u0442u0435u043au0441u0442 u043eu0448u0438u0431u043au0438');
        console.error('u041fu043eu0434u0440u043eu0431u043du043eu0441u0442u0438 u043eu0448u0438u0431u043au0438:', errorText);
        throw new Error(`u041eu0448u0438u0431u043au0430 u0441u0435u0440u0432u0435u0440u0430 (${response.status}): ${errorText}`);
      }
      
      // u0421u043du0430u0447u0430u043bu0430 u043fu043eu043bu0443u0447u0430u0435u043c u0442u0435u043au0441u0442u043eu0432u044bu0439 u043eu0442u0432u0435u0442 u0434u043bu044f u0434u0438u0430u0433u043du043eu0441u0442u0438u043au0438
      let responseText;
      try {
        responseText = await response.text();
        console.log('u041eu0442u0432u0435u0442 u0441u0435u0440u0432u0435u0440u0430 (u0441u044bu0440u043eu0439):', responseText);
      } catch (error) {
        console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043fu043eu043bu0443u0447u0435u043du0438u0438 u0442u0435u043au0441u0442u0430 u043eu0442u0432u0435u0442u0430:', error);
        throw new Error(`u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043fu043eu043bu0443u0447u0435u043du0438u0438 u043eu0442u0432u0435u0442u0430: ${error.message}`);
      }
      
      // u041fu0430u0440u0441u0438u043c JSON u0438u0437 u0442u0435u043au0441u0442u043eu0432u043eu0433u043e u043eu0442u0432u0435u0442u0430
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('u041fu043eu043bu0443u0447u0435u043du044bu0435 u0434u0430u043du043du044bu0435 (u043fu043eu0441u043bu0435 u043fu0430u0440u0441u0438u043du0433u0430):', data);
      } catch (error) {
        console.error('u041eu0448u0438u0431u043au0430 u043fu0430u0440u0441u0438u043du0433u0430 JSON:', error, 'u0422u0435u043au0441u0442 u043eu0442u0432u0435u0442u0430:', responseText);
        // u0412 u0441u043bu0443u0447u0430u0435 u043eu0448u0438u0431u043au0438 u043fu0430u0440u0441u0438u043du0433u0430, u0432u0435u0440u043du0435u043c u0440u0435u0437u0435u0440u0432u043du044bu0439 u043eu0442u0432u0435u0442 u0432u043cu0435u0441u0442u043e u0432u044bu0431u0440u043eu0441u0430 u0438u0441u043au043bu044eu0447u0435u043du0438u044f
        setMessages(prev => [...prev, {
          sender: 'assistant',
          content: `u0418u0437u0432u0438u043du0438u0442u0435, u043fu0440u043eu0438u0437u043eu0448u043bu0430 u043eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0431u0440u0430u0431u043eu0442u043au0435 u043eu0442u0432u0435u0442u0430 u043eu0442 u0441u0435u0440u0432u0435u0440u0430.`
        }]);
        setIsLoading(false);
        return; // u0417u0430u0432u0435u0440u0448u0430u0435u043c u0444u0443u043du043au0446u0438u044e, u0447u0442u043eu0431u044b u0438u0437u0431u0435u0436u0430u0442u044c u0434u0430u043bu044cu043du0435u0439u0448u0438u0445 u043eu0448u0438u0431u043eu043a
      }
      
      // u041eu0431u0440u0430u0431u0430u0442u044bu0432u0430u0435u043c u043eu0442u0432u0435u0442 u043eu0442 OpenAI API u0432 u043du043eu0432u043eu043c u0444u043eu0440u043cu0430u0442u0435
      console.log('u041fu043eu043bu0443u0447u0435u043du043du044bu0439 u043eu0442u0432u0435u0442:', data);
      
      if (data && data.message) {
        // u041du043eu0432u044bu0439 u0444u043eu0440u043cu0430u0442 u043eu0442u0432u0435u0442u0430
        const botReply = data.message.content;
        setMessages(prev => [...prev, {
          sender: 'assistant',
          content: botReply
        }]);
      } else if (data && data.choices && data.choices.length > 0) {
        // u0421u0442u0430u0440u044bu0439 u0444u043eu0440u043cu0430u0442 u043eu0442u0432u0435u0442u0430 (u0434u043bu044f u043eu0431u0440u0430u0442u043du043eu0439 u0441u043eu0432u043cu0435u0441u0442u0438u043cu043eu0441u0442u0438)
        const botReply = data.choices[0].message.content;
        setMessages(prev => [...prev, {
          sender: 'assistant',
          content: botReply
        }]);
      } else {
        console.error('u041du0435u043eu0436u0438u0434u0430u043du043du044bu0439 u0444u043eu0440u043cu0430u0442 u043eu0442u0432u0435u0442u0430:', data);
        throw new Error('u041du0435u043eu0436u0438u0434u0430u043du043du044bu0439 u0444u043eu0440u043cu0430u0442 u043eu0442u0432u0435u0442u0430 u043eu0442 API');
      }
    } catch (error) {
      console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0442u043fu0440u0430u0432u043au0435 u0441u043eu043eu0431u0449u0435u043du0438u044f:', error);
      
      // u041fu043eu043au0430u0437u044bu0432u0430u0435u043c u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044cu0441u043au043eu0435 u0441u043eu043eu0431u0449u0435u043du0438u0435 u043eu0431 u043eu0448u0438u0431u043au0435
      let errorMessage = 'u041fu0440u043eu0438u0437u043eu0448u043bu0430 u043eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0431u0440u0430u0431u043eu0442u043au0435 u0437u0430u043fu0440u043eu0441u0430';
      
      // u0414u043eu0431u0430u0432u043bu044fu0435u043c u0434u0435u0442u0430u043bu0438 u043eu0448u0438u0431u043au0438, u0435u0441u043bu0438 u043eu043du0438 u0435u0441u0442u044c
      if (error.message) {
        // u0423u0434u0430u043bu044fu0435u043c u0441u043bu0438u0448u043au043eu043c u0442u0435u0445u043du0438u0447u0435u0441u043au0438u0435 u0434u0435u0442u0430u043bu0438 u0434u043bu044f u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f
        const userFriendlyMessage = error.message.replace(/\{.*\}|\[.*\]|".*"/, '').trim();
        errorMessage += `: ${userFriendlyMessage}`;
      }
      
      // u0415u0441u043bu0438 u044du0442u043e u043eu0448u0438u0431u043au0430 Load failed, u0434u043eu0431u0430u0432u043bu044fu0435u043c u0434u043eu043fu043eu043bu043du0438u0442u0435u043bu044cu043du0443u044e u0438u043du0444u043eu0440u043cu0430u0446u0438u044e
      if (error.message && error.message.includes('Load failed')) {
        errorMessage = 'u0418u0437u0432u0438u043du0438u0442u0435, u043fu0440u043eu0438u0437u043eu0448u043bu0430 u043eu0448u0438u0431u043au0430: Load failed. u041fu043eu043fu0440u043eu0431u0443u0439u0442u0435 u043eu0431u043du043eu0432u0438u0442u044c u0441u0442u0440u0430u043du0438u0446u0443 u0438u043bu0438 u043eu0442u043fu0440u0430u0432u0438u0442u044c u0437u0430u043fu0440u043eu0441 u043fu043eu0437u0436u0435.';
      }
      
      setMessages(prev => [...prev, {
        sender: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // u041eu0431u0440u0430u0431u043eu0442u043au0430 u043du0430u0436u0430u0442u0438u044f Enter u0434u043bu044f u043eu0442u043fu0440u0430u0432u043au0438 u0441u043eu043eu0431u0449u0435u043du0438u044f
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ThemeProvider>
      <div className="app">
        <header className="chat-header">
          <h1>u041fu0440u043eu0441u0442u043eu0439 u0447u0430u0442-u0431u043eu0442</h1>
          <ThemeToggle />
        </header>
        
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <ChatMessage 
                key={index}
                sender={message.sender}
                content={message.content}
              />
            ))}
            
            {isLoading && (
              <div className="message assistant">
                <div className="avatar">A</div>
                <div className="content loading">
                  <div className="dot-flashing"></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="chat-input">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="u041du0430u043fu0438u0448u0438u0442u0435 u0432u0430u0448u0435 u0441u043eu043eu0431u0449u0435u043du0438u0435..."
              disabled={isLoading}
            ></textarea>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
            >
              u041eu0442u043fu0440u0430u0432u0438u0442u044c
            </button>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
