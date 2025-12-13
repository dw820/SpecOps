'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type UploadedFile = {
  id: string;
  filename: string;
  url: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
};

interface UploadDialogProps {
  children: React.ReactNode;
  onUploadComplete?: (files: UploadedFile[]) => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_TYPES = ['application/pdf'];

export function UploadDialog({ children, onUploadComplete }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, [files]);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only PDF files are accepted';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 20MB limit';
    }
    return null;
  }, []);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(fileList).forEach((file) => {
      const error = validateFile(file);
      newFiles.push({
        id: nanoid(),
        filename: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        status: error ? 'error' : 'pending',
        progress: 0,
        error: error || undefined,
      });
    });

    setFiles((prev) => [...prev, ...newFiles]);
  }, [validateFile]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.url);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(e.target.files);
    }
    // Reset input to allow re-selecting same file
    e.target.value = '';
  }, [addFiles]);

  const simulateProcessing = useCallback(async () => {
    setIsProcessing(true);
    
    const pendingFiles = files.filter((f) => f.status === 'pending');
    
    for (const file of pendingFiles) {
      // Update status to processing
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: 'processing' as const, progress: 0 } : f
        )
      );

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, progress } : f
          )
        );
      }

      // Mark as completed
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: 'completed' as const, progress: 100 } : f
        )
      );
    }

    setIsProcessing(false);
    
    // Notify parent of completion
    const completedFiles = files.filter((f) => f.status !== 'error');
    onUploadComplete?.(completedFiles);
    
    // Close dialog after a short delay
    setTimeout(() => {
      setOpen(false);
      setFiles([]);
    }, 500);
  }, [files, onUploadComplete]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const hasErrors = files.some((f) => f.status === 'error');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Datasheet</DialogTitle>
          <DialogDescription>
            Upload PDF datasheets to extract component specifications using AI.
          </DialogDescription>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          className={cn(
            'relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
            files.length > 0 && 'min-h-[120px]'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
          
          <div className="flex flex-col items-center gap-2 text-center">
            <div className={cn(
              'rounded-full p-3 transition-colors',
              isDragging ? 'bg-primary/10' : 'bg-muted'
            )}>
              <Upload className={cn(
                'h-6 w-6 transition-colors',
                isDragging ? 'text-primary' : 'text-muted-foreground'
              )} />
            </div>
            <div>
              <p className="font-medium">
                {isDragging ? 'Drop PDF here' : 'Drag & drop PDF files'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse (max 20MB)
              </p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="max-h-[200px] space-y-2 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3',
                  file.status === 'error' && 'border-destructive/50 bg-destructive/5',
                  file.status === 'completed' && 'border-green-500/50 bg-green-500/5'
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  file.status === 'error' ? 'bg-destructive/10' : 'bg-primary/10'
                )}>
                  <FileText className={cn(
                    'h-5 w-5',
                    file.status === 'error' ? 'text-destructive' : 'text-primary'
                  )} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-sm">{file.filename}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    {file.status === 'error' && (
                      <span className="text-xs text-destructive">{file.error}</span>
                    )}
                    {file.status === 'processing' && (
                      <span className="text-xs text-primary">Processing...</span>
                    )}
                    {file.status === 'completed' && (
                      <span className="text-xs text-green-600">Complete</span>
                    )}
                  </div>
                  {file.status === 'processing' && (
                    <Progress value={file.progress} className="mt-2 h-1" />
                  )}
                </div>

                <div className="shrink-0">
                  {file.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {file.status === 'processing' && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {file.status === 'completed' && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={simulateProcessing}
            disabled={pendingCount === 0 || isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Process {pendingCount > 0 ? `${pendingCount} ` : ''}Datasheet{pendingCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
