import { createClient } from '@/lib/supabase/server'
import { parseCSV } from '@/lib/csv-parser'
import {
  calculateAdMetrics,
  aggregateMetrics,
  findPerformanceGaps,
} from '@/lib/metrics'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { csvData, campaignName, model } = await req.json()

    if (!csvData || typeof csvData !== 'string') {
      return Response.json({ error: 'Invalid CSV data' }, { status: 400 })
    }

    // Parse CSV
    const parseResult = parseCSV(csvData)
    if (!parseResult.success || !parseResult.data) {
      return Response.json(
        { error: parseResult.error || 'Failed to parse CSV' },
        { status: 400 },
      )
    }

    const ads = parseResult.data

    // Calculate metrics
    const calculatedAds = calculateAdMetrics(ads)
    const aggregated = aggregateMetrics(calculatedAds)
    const { topPerformers, underperformers } =
      findPerformanceGaps(calculatedAds)

    const aiModel =
      model === 'gpt-4o-mini'
        ? openai('gpt-4o-mini')
        : google('gemini-2.5-flash')

    // Generate AI insights using generateObject with structured output
    const insightsResult = await generateObject({
      model: aiModel,
      maxRetries: 0, // Fails fast instead of hanging for 25s if OpenAI errors out
      system: `You are an expert advertising analyst. Analyze the provided advertising metrics and provide actionable insights. 
Be specific, data-driven, and focus on ROI optimization. Format your response as JSON.`,
      prompt: `Analyze these advertising metrics and provide insights:

Campaign Metrics Summary:
- Total Spend: $${aggregated.totalSpend}
- Total Conversions: ${aggregated.totalConversions}
- Average CTR: ${aggregated.avgCtr}%
- Average CPC: $${aggregated.avgCpc}
- Average CPA: ${aggregated.avgCpa === 0 ? 'N/A' : '$' + aggregated.avgCpa}
- Average ROAS: ${aggregated.avgRoas}x

Top Performing Ads:
${topPerformers
  .map(
    (ad, i) =>
      `${i + 1}. ${ad.adName} (ROAS: ${ad.roas}x, CTR: ${ad.ctr}%, CPC: $${ad.cpc})`,
  )
  .join('\n')}

Underperforming Ads:
${underperformers
  .map(
    (ad, i) =>
      `${i + 1}. ${ad.adName} (ROAS: ${ad.roas}x, CTR: ${ad.ctr}%, CPC: $${ad.cpc})`,
  )
  .join('\n')}

Provide:
1. A 2-3 sentence executive summary
2. Top 3 specific recommendations to improve ROAS
3. 2-3 priority actions to implement immediately
Return ONLY valid JSON with keys: summary, recommendations (array of 3), priorityActions (array of 2-3)`,
      schema: z.object({
        summary: z.string().describe('Executive summary of the analysis'),
        recommendations: z
          .array(z.string())
          .describe('Array of 3 specific recommendations'),
        priorityActions: z
          .array(z.string())
          .describe('Array of 2-3 priority actions'),
      }),
    })

    const aiInsights = insightsResult.object

    // Store analysis in database
    const { data: analysis, error: dbError } = await supabase
      .from('analyses')
      .insert({
        user_id: user.id,
        csv_data: csvData,
        metrics: {
          adMetrics: calculatedAds,
          aggregated,
          topPerformers,
          underperformers,
        },
        ai_insights: aiInsights,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return Response.json(
        { error: 'Failed to save analysis' },
        { status: 500 },
      )
    }

    return Response.json({
      analysisId: analysis.id,
      metrics: {
        adMetrics: calculatedAds,
        aggregated,
        topPerformers,
        underperformers,
      },
      aiInsights,
    })
  } catch (error) {
    console.error('Analysis error:', error)

    // Extract the actual error message to send to the browser
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error'
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
