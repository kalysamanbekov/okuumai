import React, { useState, useRef, useEffect } from 'react';
import { getChatCompletionStream } from '../services/openaiService';
import '../styles/StreamChat.css';

const StreamChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const messagesEndRef = useRef(null);

  // Прокрутка чата вниз при добавлении новых сообщений
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Добавляем сообщение пользователя
    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setCurrentResponse('');

    try {
      // Формируем массив сообщений для отправки
      const messageList = messages.concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Используем потоковую передачу через новый API
      await getChatCompletionStream(
        messageList,
        // Обработка каждого фрагмента ответа
        (chunk) => {
          setCurrentResponse(prev => prev + chunk);
        },
        // Обработка завершения потока
        (fullResponse) => {
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: fullResponse }
          ]);
          setCurrentResponse('');
          setIsTyping(false);
        },
        // Обработка ошибок
        (error) => {
          console.error('Ошибка при получении ответа:', error);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: `Произошла ошибка: ${error}` }
          ]);
          setCurrentResponse('');
          setIsTyping(false);
        }
      );
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Извините, произошла ошибка при обработке вашего запроса.' }
      ]);
      setIsTyping(false);
    }
  };

  return (
    <div className="stream-chat-container">
      <div className="chat-header">
        <h2>OKUUM.AI Чат с потоковой передачей</h2>
        <p className="subtitle">Задайте вопрос и увидите, как ответ появляется постепенно</p>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>Начните диалог, задав ваш вопрос</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.role === 'assistant' ? 'assistant' : 'user'}`}
            >
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="message assistant">
            <div className="message-content">
              {currentResponse || <div className="typing-indicator"><span></span><span></span><span></span></div>}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form className="input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Введите сообщение..."
          disabled={isTyping}
        />
        <button type="submit" disabled={isTyping || !inputValue.trim()}>
          Отправить
        </button>
      </form>
    </div>
  );
};

export default StreamChat;
