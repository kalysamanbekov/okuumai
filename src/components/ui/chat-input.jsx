import React, { useState } from 'react';
import { Button } from './button';
import { cn } from '../../lib/utils';

const ChatInput = ({ onSendMessage, isLoading, placeholder = 'u0412u0432u0435u0434u0438u0442u0435 u0432u0430u0448 u0432u043eu043fu0440u043eu0441...' }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "min-h-[80px] resize-none"
          )}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isLoading}
        />
        <Button
          type="submit"
          className="absolute right-2 bottom-2"
          size="sm"
          disabled={isLoading || !message.trim()}
        >
          {isLoading ? (
            <span className="flex items-center gap-1">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>u041eu0442u043fu0440u0430u0432u043au0430...</span>
            </span>
          ) : (
            <span>u041eu0442u043fu0440u0430u0432u0438u0442u044c</span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
