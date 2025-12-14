'use client';

import { useChat } from '@ai-sdk/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import type { ComponentData } from '@/lib/inventory';
import { cn } from '@/lib/utils';
import { MessageSquareText } from 'lucide-react';

interface ComponentQAProps {
  component: ComponentData;
  className?: string;
}

export function ComponentQA({ component, className }: ComponentQAProps) {
  const { messages, input, setInput, append, status } = useChat({
    api: '/api/inventory/chat',
    body: {
      component,
    },
  });

  const handleSendMessage = async (message: { text?: string; files?: any[] }) => {
    if (!message.text) return;
    
    await append({
      role: 'user',
      content: message.text,
    });
  };

  return (
    <Card className={cn('flex flex-col h-[600px]', className)}>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquareText className="h-5 w-5 text-primary" />
          Ask about {component.partNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative">
        <ChatMessages 
          messages={messages} 
          status={status} 
          className="flex-1 p-4"
        />
        <div className="p-4 border-t bg-background">
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={handleSendMessage}
            status={status}
            placeholder={`Ask a question about ${component.partNumber}...`}
            className="border rounded-md"
          />
        </div>
      </CardContent>
    </Card>
  );
}
