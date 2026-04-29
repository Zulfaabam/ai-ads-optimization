'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Download } from 'lucide-react'
import { usePDF } from 'react-to-pdf'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { Spinner } from '@/components/ui/spinner'
import { MetricsCards } from '@/components/metrics-cards'
import { AdPerformance } from '@/components/ad-performance'
import { AIInsights } from '@/components/ai-insights'
import { CalculatedMetrics, AggregatedMetrics } from '@/lib/metrics'
import { toast } from 'sonner'

interface Analysis {
  id: string
  created_at: string
  metrics: {
    adMetrics: CalculatedMetrics[]
    aggregated: AggregatedMetrics
    topPerformers: CalculatedMetrics[]
    underperformers: CalculatedMetrics[]
  }
  ai_insights: {
    summary: string
    recommendations: string[]
    priorityActions: string[]
  }
}

export default function HistoryPage() {
  const router = useRouter()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(
    null,
  )
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { toPDF, targetRef } = usePDF({
    filename: 'ai-ads-optimization-history.pdf',
  })

  useEffect(() => {
    checkAuthAndFetchHistory()
  }, [])

  async function checkAuthAndFetchHistory() {
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
      await fetchHistory()
    } catch (err) {
      console.error('Auth check failed:', err)
      router.push('/auth/login')
    }
  }

  async function fetchHistory() {
    try {
      setIsLoading(true)
      const response = await fetch('/api/history')

      if (!response.ok) {
        throw new Error('Failed to fetch history')
      }

      const data = await response.json()
      setAnalyses(data.analyses || [])
    } catch (err) {
      setError(String(err))
      console.error('Fetch history error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id)
      const response = await fetch(`/api/history/${id}`, { method: 'DELETE' })

      if (!response.ok) {
        toast.error('Failed to delete analysis')
        throw new Error('Failed to delete analysis')
      }

      setAnalyses(analyses.filter((a) => a.id !== id))
      toast.success('Analysis deleted')
    } catch (err) {
      setError(String(err))
      toast.error(`Delete error: ${err}`)
    } finally {
      setDeletingId(null)
    }
  }

  if (isAuthChecking || isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Spinner className='h-8 w-8' />
      </div>
    )
  }

  return (
    <main className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
      <div>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-foreground'>
            Analysis History
          </h1>
          <p className='text-muted-foreground'>
            View and manage your past analyses
          </p>
        </div>

        {error && (
          <Card className='mb-6 border-destructive/50 bg-destructive/10'>
            <CardHeader>
              <CardTitle className='text-destructive'>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-destructive'>{error}</p>
            </CardContent>
          </Card>
        )}

        {analyses.length === 0 ? (
          <Card className='border-border/50 bg-secondary/30 text-center'>
            <CardContent className='py-12'>
              <h3 className='mb-2 text-lg font-medium text-foreground'>
                No analyses yet
              </h3>
              <p className='mb-6 text-muted-foreground'>
                Get started by analyzing your ad campaigns on the dashboard
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              {analyses.length}{' '}
              {analyses.length === 1 ? 'analysis' : 'analyses'} found
            </p>
            {analyses.map((analysis) => {
              const date = new Date(analysis.created_at)
              const metrics = analysis.metrics.aggregated

              return (
                <Card
                  key={analysis.id}
                  className='border-border bg-card hover:bg-card/80 transition cursor-pointer'
                  onClick={() => setSelectedAnalysis(analysis)}
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <CardTitle className='text-lg'>
                          {date.toLocaleDateString()} at{' '}
                          {date.toLocaleTimeString()}
                        </CardTitle>
                        <CardDescription>
                          Analysis ID: {analysis.id.slice(0, 8)}...
                        </CardDescription>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDeleteId(analysis.id)
                        }}
                        disabled={deletingId === analysis.id}
                        variant='destructive'
                        size='sm'
                      >
                        {deletingId === analysis.id ? (
                          <>
                            <Spinner className='mr-2 h-3 w-3' />
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                      <div>
                        <p className='text-xs text-muted-foreground'>
                          Total Spend
                        </p>
                        <p className='text-lg font-semibold text-foreground'>
                          ${metrics.totalSpend.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-muted-foreground'>
                          Conversions
                        </p>
                        <p className='text-lg font-semibold text-foreground'>
                          {metrics.totalConversions.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-muted-foreground'>
                          Avg ROAS
                        </p>
                        <p className='text-lg font-semibold text-accent'>
                          {metrics.avgRoas.toFixed(2)}x
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-muted-foreground'>Avg CTR</p>
                        <p className='text-lg font-semibold text-foreground'>
                          {metrics.avgCtr.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Dialog
        open={!!selectedAnalysis}
        onOpenChange={(open) => !open && setSelectedAnalysis(null)}
      >
        <DialogContent className='max-w-[calc(100vw-2rem)] p-4 md:min-w-3xl lg:min-w-4xl md:max-w-6xl max-h-[85vh] overflow-y-auto'>
          <DialogHeader className='text-left'>
            <DialogTitle>Analysis Details</DialogTitle>
            <DialogDescription>
              {selectedAnalysis &&
                new Date(selectedAnalysis.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedAnalysis && (
            <div className='space-y-8 py-4'>
              <div
                ref={targetRef}
                className='space-y-8 bg-background rounded-xl'
              >
                <div className='flex justify-between items-center'>
                  <div className='mb-2'>
                    <h1 className='text-xl md:text-3xl font-bold'>
                      AI Ads Optimization Report
                    </h1>
                    <p className='text-xs md:text-base text-muted-foreground'>
                      Generated on{' '}
                      {new Date(selectedAnalysis.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button onClick={() => toPDF()} variant='default'>
                    <Download className='mr-2 h-4 w-4' />
                    Export PDF
                  </Button>
                </div>
                <div>
                  <h2 className='mb-4 text-lg md:text-xl font-semibold text-foreground'>
                    Campaign Metrics
                  </h2>
                  <MetricsCards metrics={selectedAnalysis.metrics.aggregated} />
                </div>

                <div>
                  <h2 className='mb-4 text-lg md:text-xl font-semibold text-foreground'>
                    Performance Analysis
                  </h2>
                  <AdPerformance
                    topPerformers={selectedAnalysis.metrics.topPerformers}
                    underperformers={selectedAnalysis.metrics.underperformers}
                  />
                </div>

                <div>
                  <h2 className='mb-4 text-lg md:text-xl font-semibold text-foreground'>
                    AI Insights
                  </h2>
                  <AIInsights insights={selectedAnalysis.ai_insights} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
      />
    </main>
  )
}
