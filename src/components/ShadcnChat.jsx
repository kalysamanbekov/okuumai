import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ui/chat-message';
import ChatInput from './ui/chat-input';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const ShadcnChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Прокрутка к последнему сообщению при добавлении нового
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Обработка отправки сообщения
  const handleSendMessage = async (content) => {
    // Добавляем сообщение пользователя
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Имитация ответа от ассистента с задержкой
    setTimeout(() => {
      const assistantMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        content: `Это ответ на ваше сообщение: "${content}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Очистка истории сообщений
  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto border border-border rounded-lg overflow-hidden bg-background shadow-sm">
      {/* Заголовок чата */}
      <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
        <h2 className="text-lg font-medium">OKUUM.AI Чат</h2>
        {messages.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearChat}
            className="text-muted-foreground hover:text-foreground"
          >
            Очистить чат
          </Button>
        )}
      </div>
      
      {/* Область сообщений */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Начните новую беседу</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Задайте вопрос или опишите задачу, и наш ассистент поможет вам найти решение.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage 
                key={message.id}
                sender={message.sender}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-muted rounded-lg p-4 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Ассистент печатает...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Поле ввода сообщения */}
      <div className="p-4 border-t border-border">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
          placeholder="Введите ваш вопрос..."
        />
      </div>
    </div>
  );
};

export default ShadcnChat;
