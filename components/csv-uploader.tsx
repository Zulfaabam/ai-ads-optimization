'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

interface CSVUploaderProps {
  onFileLoad: (csvData: string) => Promise<void>
  isLoading: boolean
}

export function CSVUploader({ onFileLoad, isLoading }: CSVUploaderProps) {
  const [fileName, setFileName] = useState<string>('')
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) {
      setFileName('')
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

  const handleReload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    setError('')

    try {
      const text = await file.text()
      await onFileLoad(text)
    } catch (err) {
      setError(`Failed to read file: ${String(err)}`)
    }
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
          <div className='flex items-center gap-4'>
            <Input
              ref={fileInputRef}
              type='file'
              accept='.csv'
              onChange={handleFileChange}
              onClick={(e) => {
                // Reset the input value so selecting the same file triggers onChange again
                e.currentTarget.value = ''
              }}
              disabled={isLoading}
              className='border-border cursor-pointer'
            />
            {fileName && !isLoading && (
              <span className='ml-auto text-right text-sm text-muted-foreground md:min-w-50'>
                ✓ {fileName}
              </span>
            )}
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
