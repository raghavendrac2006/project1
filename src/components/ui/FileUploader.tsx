import React, { useState, useRef } from 'react'
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

export interface FileUploaderProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSizeMB?: number
  label?: string
  description?: string
  className?: string
}

export function FileUploader({
  onFileSelect,
  accept = '.pdf,.png,.jpg,.jpeg',
  maxSizeMB = 10,
  label = 'Upload citizen document',
  description = 'Supports PDF, PNG, JPG up to 10MB',
  className,
}: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setErrorMessage(null)
    const sizeInMB = file.size / (1024 * 1024)
    if (sizeInMB > maxSizeMB) {
      setErrorMessage(`File size (${sizeInMB.toFixed(1)}MB) exceeds maximum ${maxSizeMB}MB limit.`)
      return
    }
    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-150 text-center',
          dragOver
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border/80 hover:border-primary/50 hover:bg-muted/40 bg-card/60'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground flex items-center justify-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(selectedFile.size / 1024).toFixed(0)} KB • Ready for secure upload
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
            >
              Choose different file
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-subtle">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            <p className="text-[11px] text-primary font-medium hover:underline pt-1">
              or click to browse from device
            </p>
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="text-xs text-destructive mt-1.5 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          {errorMessage}
        </p>
      )}
    </div>
  )
}
