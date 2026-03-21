# Ledger

Ledger is a React + TypeScript app for estimating recipe costs, tracking favorites, and planning budget-friendly meals.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Environment

Create a `.env` file with your Supabase project values:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

## Supabase Edge Functions

The AI-related functions use these server-side environment variables:

- `AI_API_KEY` (or `OPENAI_API_KEY`)
- `AI_API_URL` (optional, defaults to OpenAI Chat Completions endpoint)
- `AI_MODEL` (optional, defaults to `gpt-4o-mini`)
- `AI_REQUEST_TIMEOUT_MS` (optional, defaults to `20000`)
- `AI_MAX_RETRIES` (optional, defaults to `2`)
- `ALLOWED_ORIGINS` (optional, comma-separated CORS allowlist for edge functions, e.g. `https://app.example.com`)
- `ALLOW_MISSING_ORIGIN` (optional, defaults to `false`; keep `false` in production)
- `RATE_LIMIT_ALLOW_IN_MEMORY_FALLBACK` (optional, defaults to `false`; keep `false` in production)
- `ALLOW_X_FORWARDED_FOR_IP` (optional, defaults to `false`; only enable behind a trusted proxy chain)
- `SUPABASE_ANON_KEY` (required for `shared-recipe`; function fails closed if unset)
- `LOG_ERROR_STACKS` (optional, defaults to `false`; keep `false` in production)

For production, set `ALLOWED_ORIGINS` explicitly so edge functions only accept browser requests from your app domains.
Also enforce security response headers at your CDN/reverse-proxy layer. The repository includes:
- `public/_headers` for hosts that support static header files
- `netlify.toml` for Netlify
- `vercel.json` for Vercel

## Tests

```bash
npm test
```

## Quality Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
