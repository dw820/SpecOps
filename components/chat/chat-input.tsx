'use client';

import type { FileUIPart } from 'ai';
import { cn } from '@/lib/utils';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';

interface ChatInputProps {
  className?: string;
  input: string;
  setInput: (value: string) => void;
  onSend: (message: { text?: string; files?: FileUIPart[] }) => void;
  status: 'submitted' | 'streaming' | 'ready' | 'error';
  placeholder?: string;
}

export function ChatInput({
  className,
  input,
  setInput,
  onSend,
  status,
  placeholder,
}: ChatInputProps) {
  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    
    if (!(hasText || hasAttachments)) {
      return;
    }

    onSend({
      text: message.text || 'Sent with attachments',
      files: message.files,
    });

    setInput('');
  };

  return (
    <div className={cn('bg-background p-4', className)}>
      <div className="mx-auto max-w-3xl">
        <PromptInput
          onSubmit={handleSubmit}
          globalDrop
          multiple
          accept="image/*,application/pdf"
        >
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              placeholder={placeholder || "Ask about component specifications..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments label="Attach files (images, PDFs)" />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!input && status !== 'streaming'}
              status={status}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
