'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { FileUIPart } from 'ai';
import { cn } from '@/lib/utils';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  const [input, setInput] = useState('');

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const handleSendMessage = (message: { text?: string; files?: FileUIPart[] }) => {
    sendMessage({
      text: message.text || '',
      files: message.files,
    });
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-background',
        className
      )}
    >
      {/* <ChatHeader /> */}
      <ChatMessages messages={messages} status={status} />
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={handleSendMessage}
        status={status}
      />
    </div>
  );
}
