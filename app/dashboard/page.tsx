'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Download } from 'lucide-react'
import { usePDF } from 'react-to-pdf'
import { createClient } from '@/lib/supabase/client'
import { CSVUploader } from '@/components/csv-uploader'
import { MetricsCards } from '@/components/metrics-cards'
import { AIInsights } from '@/components/ai-insights'
import { AdPerformance } from '@/components/ad-performance'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CalculatedMetrics, AggregatedMetrics } from '@/lib/metrics'

const ANALYZE_BUTTON_TEXT = {
  default: 'Proceed to Analysis',
  analyzing: 'Analyzing...',
  loading: 'Analyzing...',
  retry: 'Retry Analysis',
}

interface AnalysisResult {
  analysisId: string
  metrics: {
    adMetrics: CalculatedMetrics[]
    aggregated: AggregatedMetrics
    topPerformers: CalculatedMetrics[]
    underperformers: CalculatedMetrics[]
  }
  aiInsights: {
    summary: string
    recommendations: string[]
    priorityActions: string[]
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  )
  const [error, setError] = useState<string>('')
  const [rawCsvData, setRawCsvData] = useState<string | null>(null)
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([])
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash')

  const { toPDF, targetRef } = usePDF({
    filename: 'ai-ads-optimization-report.pdf',
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setIsAuthChecking(false)
    } catch (err) {
      console.error('Auth check failed:', err)
      router.push('/auth/login')
    }
  }

  async function handleFileLoad(csvData: string) {
    setRawCsvData(csvData)
    setAnalysisResult(null)
    setError('')

    try {
      const lines = csvData.trim().split('\n')
      if (lines.length < 2) {
        throw new Error(
          'CSV must contain a header row and at least one data row',
        )
      }
      const headers = lines[0].split(',').map((h) => h.trim())
      const rows = lines.slice(1).map((line) => {
        const values = line.split(',')
        const obj: Record<string, string> = {}
        headers.forEach((h, i) => {
          obj[h] = values[i]?.trim() || ''
        })
        return obj
      })
      setParsedHeaders(headers)
      setParsedRows(rows)
    } catch (err) {
      setError(String(err))
      setParsedHeaders([])
      setParsedRows([])
    }
  }

  async function handleAnalyze() {
    if (!rawCsvData) return
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: rawCsvData, model: selectedModel }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Analysis failed')
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (err) {
      setError(String(err))
      console.error('Analysis error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthChecking) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Spinner className='h-8 w-8' />
      </div>
    )
  }

  return (
    <main className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
      <div className='space-y-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-foreground'>
              Analyze With AI
            </h1>
            <p className='text-muted-foreground'>
              Analyze your campaigns with AI-powered insights
            </p>
          </div>
          {/* Model Selection */}
          <div className='flex items-center justify-end gap-4'>
            <p className='text-sm font-medium text-foreground'>AI Model:</p>
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
              disabled={isLoading}
            >
              <SelectTrigger className='w-50'>
                <SelectValue placeholder='Select an AI model' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='gemini-2.5-flash'>
                  Gemini 2.5 Flash
                </SelectItem>
                <SelectItem value='gpt-4o-mini'>GPT-4o Mini</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Upload Section */}
        <div>
          <CSVUploader onFileLoad={handleFileLoad} isLoading={isLoading} />
        </div>

        {/* Error Display */}
        {error && (
          <Card className='border-destructive/50 bg-destructive/10'>
            <CardHeader>
              <CardTitle className='text-destructive'>Error</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-sm text-destructive'>{error}</p>
              {/* {rawCsvData && (
                <Button
                  variant='destructive'
                  onClick={handleAnalyze}
                  disabled={isLoading}
                >
                  Retry Analysis
                </Button>
              )} */}
            </CardContent>
          </Card>
        )}

        {/* Parsed Data Preview */}
        {parsedRows.length > 0 && (
          <Card className='border-border bg-card'>
            <CardHeader className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>
                  Review your parsed data before analyzing
                </CardDescription>
              </div>
              <Button
                variant={error ? 'destructive' : 'default'}
                onClick={handleAnalyze}
                disabled={isLoading}
              >
                {isLoading && <Spinner className='mr-2 h-4 w-4' />}
                {
                  ANALYZE_BUTTON_TEXT[
                    isLoading
                      ? 'loading'
                      : error || !!analysisResult
                        ? 'retry'
                        : 'default'
                  ]
                }
              </Button>
            </CardHeader>
            <CardContent>
              <div className='rounded-md border border-border overflow-y-scroll max-h-96'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {parsedHeaders.map((h, i) => (
                        <TableHead key={i}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row, i) => (
                      <TableRow key={i}>
                        {parsedHeaders.map((h, j) => (
                          <TableCell key={j}>{row[h]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {analysisResult && (
          <div className='space-y-8'>
            <div
              ref={targetRef}
              className='space-y-8 bg-background p-6 rounded-xl'
            >
              <div className='mb-2'>
                <h1 className='text-3xl font-bold'>
                  AI Ads Optimization Report
                </h1>
                <p className='text-muted-foreground'>
                  Generated on {new Date().toLocaleString()}
                </p>
              </div>
              {/* Metrics Overview */}
              <div>
                <h2 className='mb-4 text-xl font-semibold text-foreground'>
                  Campaign Metrics
                </h2>
                <MetricsCards metrics={analysisResult.metrics.aggregated} />
              </div>

              {/* Ad Performance */}
              <div>
                <h2 className='mb-4 text-xl font-semibold text-foreground'>
                  Performance Analysis
                </h2>
                <AdPerformance
                  topPerformers={analysisResult.metrics.topPerformers}
                  underperformers={analysisResult.metrics.underperformers}
                />
              </div>

              {/* AI Insights */}
              <div>
                <h2 className='mb-4 text-xl font-semibold text-foreground'>
                  AI Insights
                </h2>
                <AIInsights insights={analysisResult.aiInsights} />
              </div>
            </div>

            {/* History Link */}
            <div className='flex justify-center pt-4 gap-4'>
              <Button onClick={() => toPDF()} variant='default'>
                <Download className='mr-2 h-4 w-4' />
                Export PDF
              </Button>
              <Button
                onClick={() => router.push('/history')}
                variant='outline'
                className='border-border'
              >
                View Analysis History
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analysisResult && !isLoading && !error && parsedRows.length === 0 && (
          <Card className='border-border/50 bg-secondary/30 text-center'>
            <CardContent className='py-12'>
              <h3 className='mb-2 text-lg font-medium text-foreground'>
                Ready to analyze?
              </h3>
              <p className='text-muted-foreground'>
                Upload a CSV file above to get started with AI-powered ad
                optimization
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
