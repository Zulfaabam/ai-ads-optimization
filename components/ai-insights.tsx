'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AIInsightsProps {
  insights: {
    summary: string
    recommendations: string[]
    priorityActions: string[]
  }
}

export function AIInsights({ insights }: AIInsightsProps) {
  return (
    <div className='space-y-4'>
      {/* Executive Summary */}
      <Card className='border-border bg-card'>
        <CardHeader>
          <CardTitle className='text-lg'>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground leading-relaxed'>
            {insights.summary}
          </p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className='border-border bg-card'>
        <CardHeader>
          <CardTitle className='text-lg'>Top Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className='space-y-3'>
            {insights.recommendations.map((rec, index) => (
              <li key={index} className='flex gap-3'>
                <span className='inline-flex size-6 p-2 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary'>
                  {index + 1}
                </span>
                <span className='text-muted-foreground leading-relaxed'>
                  {rec}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Priority Actions */}
      <Card className='border-border bg-card'>
        <CardHeader>
          <CardTitle className='text-lg text-accent'>
            Priority Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='space-y-2'>
            {insights.priorityActions.map((action, index) => (
              <li key={index} className='flex items-start gap-3'>
                <span className='mt-2 size-2 rounded-full bg-accent shrink-0'></span>
                <span className='text-muted-foreground'>{action}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
