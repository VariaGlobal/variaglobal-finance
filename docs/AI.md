# AI layer

How AI is wired into variaglobal-finance, and the rules it lives under.

## Policy (from FINANCE-SYSTEM-ARCHITECTURE.md, section 5.9)

AI suggests. Humans decide. Engines compute. No model output ever becomes a record
without a recorded human acceptance, and no arithmetic ever runs through a model.
Deterministic rules run before any model call (see the prior-mapping shortcut in
/api/ai/categorize).

## How it is wired

- Vercel AI Gateway via its OpenAI-compatible REST endpoint, using plain fetch.
  Zero new npm dependencies, so the pnpm lockfile is untouched and Vercel builds
  keep working. `lib/ai/gateway.ts` is the only file that knows how models are
  called — swap it to the AI SDK later without touching callers.
- Every AI output is wrapped in a `SuggestionRecord` (`lib/ai/suggestions.ts`):
  kind, objectRef, payload, model, confidence, source, pending status. In the
  database phase this becomes the `ai_suggestions` table unchanged.

## Setup (one time)

1. Vercel dashboard -> AI Gateway -> API keys -> create key.
2. Add `AI_GATEWAY_API_KEY` to the variaglobal-finance project environment
   (Production + Preview + Development), then redeploy.
3. Verify: open `/api/ai/health` — expect `{ "configured": true, "gateway": "ok" }`.

## Endpoints

- `GET /api/ai/health` — wiring check.
- `POST /api/ai/categorize` — body: `{ description, counterparty?, amountDisplay?,
  objectRef?, priorMappings? }`. Returns `{ suggestion, ui }` where `ui` matches
  the `AiSuggestion` type the components already render. If a prior accepted
  mapping matches, no model is called (source `rule:prior-mapping`, confidence 100).

## Next steps (post-DB)

- Persist `SuggestionRecord` to Postgres (`ai_suggestions`) and record accept/reject
  decisions with `decidedBy`/`decidedAt`.
- Match-candidate ranking endpoint for the reconciliation queue.
- PDF contract-term extraction behind the same envelope.
