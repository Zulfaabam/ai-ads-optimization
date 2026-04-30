'use client'

import { useState, useRef } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { UploadCloud, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CSVUploaderProps {
  onFileLoad: (csvData: string) => Promise<void>
  isLoading: boolean
}

export function CSVUploader({ onFileLoad, isLoading }: CSVUploaderProps) {
  const [fileName, setFileName] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    processFile(file)
  }

  const processFile = async (file: File | undefined) => {
    if (!file) {
      setFileName('')
      return
    }

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.')
      return
    }

    setError('')
    setFileName(file.name)

    try {
      const text = await file.text()
      await onFileLoad(text)
    } catch (err) {
      setError(`Failed to read file: ${String(err)}`)
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => {
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    processFile(file)
  }

  return (
    <Card className='border-border bg-card'>
      <CardHeader>
        <CardTitle>Upload Ad Campaign Data</CardTitle>
        <CardDescription>
          Upload a CSV file with columns: adName, impressions, clicks, spend,
          conversions.{' '}
          <a
            href='/ads-data-template.csv'
            download
            className='text-primary hover:underline font-medium'
          >
            Download template
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div
            className={cn(
              'relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 ease-in-out py-12 flex flex-col items-center justify-center gap-4 bg-muted/30 hover:bg-muted/50',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
              isLoading && 'opacity-50 cursor-not-allowed',
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !isLoading && fileInputRef.current?.click()}
          >
            <Input
              ref={fileInputRef}
              type='file'
              accept='.csv'
              onChange={handleFileChange}
              onClick={(e) => {
                e.stopPropagation()
                e.currentTarget.value = ''
              }}
              disabled={isLoading}
              className='hidden'
            />

            <div
              className={cn(
                'p-4 rounded-full bg-background border border-border shadow-sm transition-transform duration-200 group-hover:scale-110',
                isDragging && 'scale-110 border-primary shadow-primary/20',
              )}
            >
              <UploadCloud
                className={cn(
                  'h-8 w-8 text-muted-foreground transition-colors duration-200',
                  isDragging && 'text-primary',
                  'group-hover:text-primary',
                )}
              />
            </div>

            <div className='text-center space-y-1 px-4'>
              <p className='text-base font-semibold text-foreground'>
                {fileName ? (
                  <span className='flex items-center gap-2 justify-center'>
                    <CheckCircle2 className='h-4 w-4 text-accent' />
                    {fileName}
                  </span>
                ) : (
                  <span className='flex flex-col gap-1'>
                    <span className='text-lg font-medium text-foreground'>
                      Ready to analyze?
                    </span>
                    <span className='text-muted-foreground'>
                      Click to upload or drag and drop a CSV file <br />
                      to get started with AI-powered ad optimization.
                    </span>
                  </span>
                )}
              </p>
              <p className='text-sm text-muted-foreground'>
                CSV file (Max. 10MB)
              </p>
            </div>
          </div>

          {error && (
            <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
              {error}
            </div>
          )}

          {isLoading && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Spinner className='h-4 w-4' />
              Analyzing your data...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
