'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalculatedMetrics } from '@/lib/metrics';

interface AdPerformanceProps {
  topPerformers: CalculatedMetrics[];
  underperformers: CalculatedMetrics[];
}

function AdRow({ ad, badge }: { ad: CalculatedMetrics; badge: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-border bg-secondary/30 p-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground">{ad.adName}</p>
          {badge}
        </div>
        <p className="text-xs text-muted-foreground">
          {ad.impressions.toLocaleString()} impressions • {ad.clicks.toLocaleString()} clicks
        </p>
      </div>
      <div className="text-right space-y-1">
        <div className="text-sm font-semibold text-accent">{ad.roas.toFixed(2)}x ROAS</div>
        <div className="text-xs text-muted-foreground space-x-2">
          <span>{ad.ctr.toFixed(2)}% CTR</span>
          <span>${ad.cpc.toFixed(2)} CPC</span>
        </div>
      </div>
    </div>
  );
}

export function AdPerformance({ topPerformers, underperformers }: AdPerformanceProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Top Performers */}
      <Card className="border-border bg-card border-accent/30 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-lg">Top Performers 🚀</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((ad, index) => (
                <AdRow
                  key={ad.adName}
                  ad={ad}
                  badge={
                    <span className="inline-block rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                      #{index + 1}
                    </span>
                  }
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Underperformers */}
      <Card className="border-border bg-card border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Needs Improvement ⚠️</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {underperformers.length > 0 ? (
              underperformers.map((ad, index) => (
                <AdRow
                  key={ad.adName}
                  ad={ad}
                  badge={
                    <span className="inline-block rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-medium text-destructive">
                      #{underperformers.length - index}
                    </span>
                  }
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
