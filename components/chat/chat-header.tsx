'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ChatHeaderProps {
  className?: string;
  title?: string;
  children?: ReactNode;
}

export function ChatHeader({
  className,
  title = 'SpecOps AI',
  children,
}: ChatHeaderProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-primary-foreground"
          >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>
      {children}
    </header>
  );
}
