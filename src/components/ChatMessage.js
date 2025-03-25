import React from 'react';
import '../styles/ChatMessage.css';

const ChatMessage = ({ message }) => {
  const { text, sender } = message;
  const isAi = sender === 'ai';
  
  return (
    <div className={`message ${isAi ? 'ai-message' : 'user-message'}`}>
      <div className="message-content">
        {text}
      </div>
    </div>
  );
};

export default ChatMessage;
