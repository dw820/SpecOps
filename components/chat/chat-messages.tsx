'use client';

import type { UIMessage } from 'ai';
import { cn } from '@/lib/utils';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageAttachment,
  MessageAttachments,
} from '@/components/ai-elements/message';
import { Loader } from '@/components/ai-elements/loader';
import { MessageCircle } from 'lucide-react';

interface ChatMessagesProps {
  className?: string;
  messages: UIMessage[];
  status: 'submitted' | 'streaming' | 'ready' | 'error';
}

export function ChatMessages({ className, messages, status }: ChatMessagesProps) {
  const isLoading = status === 'submitted';
  const isEmpty = messages.length === 0;

  return (
    <Conversation className={cn('flex-1', className)}>
      <ConversationContent className="mx-auto max-w-3xl">
        {isEmpty ? (
          <ConversationEmptyState
            icon={<MessageCircle className="h-12 w-12" />}
            title="Welcome to SpecOps AI"
            description="Upload component datasheets and ask questions about specifications, compatibility, and comparisons."
          />
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id}>
                {message.parts.map((part, i) => {
                  if (part.type === 'text') {
                    return (
                      <Message key={`${message.id}-${i}`} from={message.role}>
                        <MessageContent>
                          <MessageResponse>{part.text}</MessageResponse>
                        </MessageContent>
                      </Message>
                    );
                  }
                  if (part.type === 'file') {
                    return (
                      <Message key={`${message.id}-${i}`} from={message.role}>
                        <MessageContent>
                          <MessageAttachments>
                            <MessageAttachment data={part} />
                          </MessageAttachments>
                        </MessageContent>
                      </Message>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
            {isLoading && (
              <Message from="assistant">
                <MessageContent>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader size={16} />
                    <span>Thinking...</span>
                  </div>
                </MessageContent>
              </Message>
            )}
          </>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
