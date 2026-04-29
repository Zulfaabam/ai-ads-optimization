# AI Ads Optimization Advisor

A modern SaaS application that analyzes advertising campaigns using AI-powered insights. Upload your ad performance data as a CSV file and receive actionable recommendations to optimize your ROAS.

## Features

- **CSV Upload & Analysis**: Upload ad campaign data with impressions, clicks, spend, and conversions
- **Metrics Calculation**: Automatic calculation of CTR, CPC, CPA, and ROAS metrics
- **AI-Powered Insights**: OpenAI or Google AI-generated recommendations based on your campaign data
- **Performance Comparison**: Identify top-performing and underperforming ads
- **Analysis History**: Store and manage previous analyses
- **Secure Authentication**: Email/password authentication with Supabase
- **Export to PDF**: Export the analysis result into PDF file

## Tech Stack

- **Frontend**: Next.js 16, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4o-mini & Gemini 2.5 Flash via Vercel AI SDK
- **CSV Parsing**: PapaParse

## CSV Format

Upload a CSV file with the following columns:

```
adName,platform,impressions,clicks,spend,conversions,revenue,dateRange
Sample ad,Facebook,15000,450,120.50,15,0,2026-04-01 to 2026-04-07
Sample campaign,Facebook,8000,320,85.00,22,0,2026-04-01 to 2026-04-07
```

- **adName**: Name/identifier of the ad campaign (string)
- **platform**: Platform where the ad was run (string)
- **impressions**: Number of times the ad was shown (integer)
- **clicks**: Number of clicks on the ad (integer)
- **spend**: Amount spent in dollars (number)
- **conversions**: Number of conversions/purchases (integer)
- **revenue**: Revenue generated from the ad (number)
- **dateRange**: Date range for the ad performance (string)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository and install dependencies:

```bash
git clone <url>

cd ai-ads-optimization

pnpm install
```

2. Set up environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key
```

3. Run database migrations:

```bash
# Execute scripts/01_init_db.sql in Supabase SQL Editor
# Execute scripts/02_create_user_trigger.sql in Supabase SQL Editor
```

4. Start the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Sign Up**: Create an account with your email and password
2. **Login**: Access your dashboard
3. **Upload CSV**: Select a CSV file with your ad campaign data
4. **View Analysis**: Get instant metrics and AI-powered insights
5. **View History**: Access previous analyses from the history page
6. **Export to PDF**: Export the analysis result into PDF file

## Metrics Explained

- **CTR (Click-Through Rate)**: Percentage of impressions that resulted in clicks
- **CPC (Cost Per Click)**: Average cost for each click on your ad
- **CPA (Cost Per Acquisition)**: Average cost for each conversion
- **ROAS (Return on Ad Spend)**: Revenue generated per dollar spent (calculated as conversions/spend)

## API Routes

- `POST /api/analyze` - Analyze CSV data and generate insights
- `GET /api/history` - Retrieve user's analysis history
- `DELETE /api/history/[id]` - Delete a specific analysis

## Project Structure

```
app/
  auth/
    login/page.tsx
    sign-up/page.tsx
    callback/route.ts
  dashboard/page.tsx
  history/page.tsx
  api/
    analyze/route.ts
    history/route.ts
    history/[id]/route.ts
  layout.tsx
  globals.css
components/
  csv-uploader.tsx
  metrics-cards.tsx
  ai-insights.tsx
  ad-performance.tsx
lib/
  supabase/
    client.ts
    server.ts
    proxy.ts
  metrics.ts
  csv-parser.ts
```

## Database Schema

### users

- `id` (UUID, PK) - References auth.users
- `email` (TEXT)
- `created_at` (TIMESTAMP)

### campaigns

- `id` (UUID, PK)
- `user_id` (UUID, FK) - References users
- `name` (TEXT)
- `created_at` (TIMESTAMP)

### analyses

- `id` (UUID, PK)
- `user_id` (UUID, FK) - References users
- `campaign_id` (UUID, FK) - References campaigns
- `csv_data` (TEXT) - Original CSV content
- `metrics` (JSONB) - Calculated metrics
- `ai_insights` (JSONB) - AI-generated insights
- `created_at` (TIMESTAMP)

## Security

- **Row Level Security (RLS)**: All data is protected with RLS policies
- **Authentication**: All routes require user authentication
- **Data Isolation**: Users can only access their own data
- **Password Hashing**: Supabase Auth handles password security

## Future Enhancements

- Multi-file bulk uploads
- Custom metric calculations
- Scheduled email reports
- A/B testing recommendations
- Integration with Google Ads and Facebook Ads APIs
- Advanced filtering and sorting

## Support

For issues or questions, please check the Supabase documentation, OpenAI API docs, or Google AI Platform docs.
