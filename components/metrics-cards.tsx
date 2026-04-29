'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AggregatedMetrics } from '@/lib/metrics';

interface MetricsCardsProps {
  metrics: AggregatedMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const metricsList = [
    {
      label: 'Total Spend',
      value: `$${metrics.totalSpend.toLocaleString()}`,
      subtext: `${metrics.adCount} ads`,
    },
    {
      label: 'Total Conversions',
      value: metrics.totalConversions.toLocaleString(),
      subtext: `${metrics.totalImpressions.toLocaleString()} impressions`,
    },
    {
      label: 'Avg CTR',
      value: `${metrics.avgCtr.toFixed(2)}%`,
      subtext: `${metrics.totalClicks.toLocaleString()} clicks`,
    },
    {
      label: 'Avg CPC',
      value: `$${metrics.avgCpc.toFixed(2)}`,
      subtext: 'Cost per click',
    },
    {
      label: 'Avg CPA',
      value: metrics.avgCpa === 0 ? 'N/A' : `$${metrics.avgCpa.toFixed(2)}`,
      subtext: 'Cost per acquisition',
    },
    {
      label: 'Avg ROAS',
      value: `${metrics.avgRoas.toFixed(2)}x`,
      subtext: 'Return on ad spend',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metricsList.map((metric, index) => (
        <Card key={index} className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.subtext}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
