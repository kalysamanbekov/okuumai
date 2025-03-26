import React from 'react';
import { cn } from '../../lib/utils';

const ChatMessage = ({ sender, content, timestamp }) => {
  const isUser = sender === 'user';
  
  return (
    <div className={cn(
      "flex w-full mb-4 animate-in fade-in-0 slide-in-from-bottom-3",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex max-w-[80%] rounded-lg p-4",
        isUser 
          ? "bg-primary text-primary-foreground rounded-br-none" 
          : "bg-muted rounded-bl-none"
      )}>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium",
              isUser 
                ? "bg-primary-foreground text-primary" 
                : "bg-primary/10 text-primary"
            )}>
              {isUser ? 'U' : 'A'}
            </div>
            <span className="text-sm font-medium">
              {isUser ? 'Вы' : 'Ассистент'}
            </span>
            {timestamp && (
              <span className="text-xs text-muted-foreground ml-auto">
                {timestamp}
              </span>
            )}
          </div>
          <div className="prose prose-sm dark:prose-invert">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
