// Utility functions for calculating advertising metrics

export interface AdMetrics {
  adName: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
}

export interface CalculatedMetrics extends AdMetrics {
  ctr: number; // Click-through rate (clicks / impressions * 100)
  cpc: number; // Cost per click (spend / clicks)
  cpa: number; // Cost per acquisition (spend / conversions)
  roas: number; // Return on ad spend (conversions / spend)
}

export interface AggregatedMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  totalConversions: number;
  avgCtr: number;
  avgCpc: number;
  avgCpa: number;
  avgRoas: number;
  adCount: number;
}

/**
 * Calculate individual ad metrics
 */
export function calculateAdMetrics(ads: AdMetrics[]): CalculatedMetrics[] {
  return ads.map((ad) => {
    const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
    const cpc = ad.clicks > 0 ? ad.spend / ad.clicks : 0;
    const cpa = ad.conversions > 0 ? ad.spend / ad.conversions : Infinity;
    const roas = ad.spend > 0 ? ad.conversions / ad.spend : 0;

    return {
      ...ad,
      ctr: parseFloat(ctr.toFixed(2)),
      cpc: parseFloat(cpc.toFixed(2)),
      cpa: isFinite(cpa) ? parseFloat(cpa.toFixed(2)) : 0,
      roas: parseFloat(roas.toFixed(2)),
    };
  });
}

/**
 * Calculate aggregated metrics across all ads
 */
export function aggregateMetrics(ads: CalculatedMetrics[]): AggregatedMetrics {
  if (ads.length === 0) {
    return {
      totalImpressions: 0,
      totalClicks: 0,
      totalSpend: 0,
      totalConversions: 0,
      avgCtr: 0,
      avgCpc: 0,
      avgCpa: 0,
      avgRoas: 0,
      adCount: 0,
    };
  }

  const totals = ads.reduce(
    (acc, ad) => ({
      impressions: acc.impressions + ad.impressions,
      clicks: acc.clicks + ad.clicks,
      spend: acc.spend + ad.spend,
      conversions: acc.conversions + ad.conversions,
    }),
    { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
  );

  const avgCtr =
    totals.impressions > 0
      ? (totals.clicks / totals.impressions) * 100
      : 0;
  const avgCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  const avgCpa =
    totals.conversions > 0
      ? totals.spend / totals.conversions
      : Infinity;
  const avgRoas = totals.spend > 0 ? totals.conversions / totals.spend : 0;

  return {
    totalImpressions: totals.impressions,
    totalClicks: totals.clicks,
    totalSpend: parseFloat(totals.spend.toFixed(2)),
    totalConversions: totals.conversions,
    avgCtr: parseFloat(avgCtr.toFixed(2)),
    avgCpc: parseFloat(avgCpc.toFixed(2)),
    avgCpa: isFinite(avgCpa) ? parseFloat(avgCpa.toFixed(2)) : 0,
    avgRoas: parseFloat(avgRoas.toFixed(2)),
    adCount: ads.length,
  };
}

/**
 * Find top and underperforming ads
 */
export function findPerformanceGaps(ads: CalculatedMetrics[]) {
  if (ads.length === 0) {
    return { topPerformers: [], underperformers: [] };
  }

  const sorted = [...ads].sort((a, b) => b.roas - a.roas);

  return {
    topPerformers: sorted.slice(0, 3),
    underperformers: sorted.slice(-3).reverse(),
  };
}
