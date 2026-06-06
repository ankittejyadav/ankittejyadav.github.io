---
tagline: "AI-powered personal life-management dashboard unifying fitness, nutrition, language learning, job tracking, and location intelligence"
role: "Solo full-stack developer"
status: "active"
stack: ""
highlights: ""
pushedAt: "2026-06-06T18:57:08Z"
---

## Problem

I was using 6+ disconnected apps for workouts, food logging, language practice, job applications, and calendar management. None of them talked to each other, and none gave me cross-domain insights like "you skipped protein today but had a heavy leg day." I wanted a single, self-hosted dashboard where an AI assistant could reason across all my personal data — fitness history, nutrition logs, location patterns, calendar events — and give me actionable, context-aware advice without my data leaving my own infrastructure.

## Architecture

The app is a **SvelteKit 5 modular monolith** deployed on **Vercel** with **Supabase** as the data layer:

- **Frontend**: Svelte 5 Runes (`$state`, `$derived`, `$effect`, `$props`) with a glassmorphism design system in Vanilla CSS using CSS Custom Properties. Full i18n support with locale-aware date/time formatting via `Intl.DateTimeFormat`. Responsive design with SSR (Server-Side Rendering).
- **Backend**: SvelteKit server routes (`+page.server.js`) and RESTful API endpoints (`+server.js`). Every route verifies the session via `locals.auth()`. Domain logic is modularized into 15+ `*-db.js` data access layers (workout-db, nutrition-db, runs-db, jobs-db, wellness-db, notes-db, measurements-db, rewards-db, geofences-db, familytree-db, etc.).
- **AI Engine** (`src/lib/server/ai/`): A modular intelligence layer with 7 domain modules — `engine.js` (core multi-model fallback chain + multi-turn tool-calling loop), `nutrition.js` (food analysis + critique chat + RDA goals), `workouts.js` (progressive overload + split rotation + routine generation), `language.js` (transcription + pronunciation grading), `jobs.js` (ATS parsing + resume analysis + cover letter + follow-up drafting), `media.js` (actionable insight extraction with A2UI), and `activity.js` (general activity calorie/macro credits). Each module enforces strict JSON output schemas with sanitization, retry logic, and confidence scoring.
- **Database**: Supabase PostgreSQL with PostGIS geography columns for location data, managed through Supabase CLI migrations. Coordinates stored as EWKB are decoded server-side for geofence proximity checks (Haversine) and reverse geocoding.
- **Auth & Security**: Auth.js with Google OAuth 2.0. Google Calendar and Spotify integrations use per-user OAuth tokens stored in a credentials table with automatic refresh and expiry buffering. Bearer token auth for API routes, input validation and sanitization on all server endpoints, email allowlist checks.
- **External API Integrations**: Google Calendar API (full CRUD with OAuth token lifecycle), Google Gemini API (5-model fallback chain), USDA FoodData Central (35+ nutrient ID mapping), Open-Meteo Weather API (15-min TTL cache), Spotify API (OAuth connect + media tracking), Nominatim/OpenStreetMap (reverse geocoding).

Data flows through a centralized **dashboard context aggregator** (`context.js`) that parallelizes 9 Supabase queries + a Google Calendar fetch + a weather API call to hydrate the home screen in a single server load — delivering weather, upcoming events, today's workout summary, daily calorie/protein totals, and lifetime stats.

## Feature Modules

### AI Conversational Assistant
The dashboard has a conversational AI assistant powered by Gemini with **LLM function calling (tool use)**. The AI can autonomously issue `query_supabase` tool calls against user data in a multi-turn conversation loop (capped at 3 turns). Security is enforced through table allowlisting (10 tables), reserved `user_id` columns immune from AI manipulation, query limits (max 100 rows, max 3 filters), and join-aware scoping (e.g., `workout_sets` scopes through `workout_sessions.user_id`). Real-time LLM status events are emitted so the UI can show which model is being attempted.

### Nutrition Tracker
- **Multimodal food analysis**: Log food via text description, food photo (Gemini Vision), or nutrition label photo
- **Structured JSON output**: AI returns 30+ nutrient keys matching an internal schema, with per-nutrient confidence levels and dietary warnings
- **USDA FoodData Central integration**: Ground-truth fallback mapping 35+ USDA nutrient IDs to internal keys
- **Personalized RDA goal generation**: Uses Mifflin-St Jeor BMR equation, adjusted for user profile (age, gender, height, weight, health goal)
- **"Tough-Love Trainer" critique chat**: Conversational dietary coaching persona with awareness of daily goals, food history, and user profile — supports multi-turn follow-up conversations
- **Reliability engineering**: `responseMimeType: 'application/json'` for format enforcement, sanitization against `ALL_NUTRIENTS`, automatic retry with stricter prompt on parse failure, floating-point rounding

### Workout System
- **AI progressive overload recommendations**: Analyzes historical workout data, body metrics, and target vs. logged reps to recommend next-session weight/sets/reps with form cues
- **Split rotation prediction**: AI recommends the next workout split based on actual session history, candidate splits, and recency patterns
- **Batch split targets**: Generates targets for every exercise in a selected split with per-exercise reasoning and visual hints
- **Custom routine generation**: Natural-language prompts ("15 minute abs", "dumbbell only legs") generate structured exercise routines
- **Calorie/macro recovery credits**: Estimates post-workout nutrient budget increases for recovery, stored as negative adjustments to offset daily consumption

### Language Learning
- **Real-time audio transcription**: Audio buffer → base64 → Gemini for accurate speech-to-text
- **AI pronunciation grading**: Compares spoken audio against target phrases with a "Supportive Polyglot" persona, returning pronunciation scores (0-100), phonetic breakdowns, cultural tips, and native/target language feedback
- **Text-to-Speech API endpoint**: Server-side TTS for conversational practice
- **Multi-language support**: Configurable native and target languages with language profiles and session tracking

### Job Application Tracker
- **AI-powered ATS parsing**: Extracts structured metadata (title, company, location, salary, requirements, keywords, contacts) from raw job posting text with confidence scoring
- **Resume fit-score analysis**: Compares resume against extracted job details, returning fit score (0-100), missing/matched keywords, risk flags, bullet rewrites, and interview questions
- **Automated cover letter drafting**: Generates tailored cover letters based on resume-to-job mapping
- **Follow-up email composition**: Creates polished follow-up emails based on application timeline and status
- **Structured JSON normalization**: Robust `normalizeJobDraft()`, `normalizeResumeAnalysis()`, and `normalizeFollowUpDraft()` with snake_case/camelCase handling and default enforcement

### Location Intelligence
- **PostGIS coordinate storage**: Geography columns with EWKB binary encoding
- **Server-side EWKB decoding**: Parses hex string endianness byte and extracts Float64 lat/lng at specific byte offsets
- **Geofencing**: Haversine distance calculation for proximity detection against user-defined geofences
- **Reverse geocoding**: Nominatim/OpenStreetMap integration for place name resolution
- **Weather enrichment**: Open-Meteo API with 15-minute TTL cache keyed by rounded coordinates (~110m precision)

### Google Calendar Integration
- **Full OAuth2 token lifecycle**: Access token refresh with 5-minute expiry buffer, refresh token rotation, credential persistence to Supabase
- **CRUD operations**: Create, read, update, and delete calendar events via Google Calendar API v3
- **Edge case handling**: `invalid_grant` detection with diagnostic hints for Testing vs. Production mode Google Cloud apps
- **Multi-user support**: Per-user credential storage with configurable calendar IDs

### Media Insights Engine
- **Actionable insight extraction**: Processes YouTube videos and Spotify podcasts through an "Agentic Life Strategist" persona
- **A2UI (Agent-to-User Interface)**: Structured component specification with `InsightCard` and `Button` components, action types (`CREATE_TASK`, `SAVE_NOTE`, `SCHEDULE_WORKOUT`)
- **Cross-domain integration**: Insights link to Calendar, Tasks, Nutrition, and Workout trackers

### Multi-User Dashboard
- **User switching**: View other users' status from the dashboard with cross-user status cards
- **Module-specific views**: Tracker, Workout, and Nutrition cards per user
- **Privacy controls**: Role-based visibility with `privacy.js` enforcement

### Privacy & GDPR Compliance
- **Account deletion lifecycle**: `active` → `pending_delete` (30-day grace) → `deleted`
- **Privacy request audit logging**: `privacy_requests` table tracking request type, status, timestamps
- **User-initiated restore**: Cancel pending deletion during grace window
- **Data minimization**: Principle of least privilege on all queries — only return columns and rows the current user needs

## Tech Stack (Complete)

| Category | Technologies |
|---|---|
| **Frontend** | SvelteKit 5, Svelte 5, Svelte Runes ($state, $derived, $effect, $props), Vanilla CSS, CSS Custom Properties, Glassmorphism, Responsive Design, SSR (Server-Side Rendering) |
| **Backend** | SvelteKit Server Routes, SvelteKit API Routes, Node.js, Server Actions, RESTful API Design |
| **Database** | Supabase, PostgreSQL, PostGIS, EWKB, Row-Level Security (RLS), Database Migrations, Geospatial Data |
| **AI / ML** | Google Gemini API, Gemini Vision (multimodal), Large Language Models (LLMs), LLM Function Calling / Tool Use, Multi-Model Fallback Chains, Structured JSON Output, Prompt Engineering, AI Agent Architecture |
| **Auth & Security** | Auth.js (NextAuth), Google OAuth 2.0, OAuth Token Refresh, Bearer Token Auth, Session Management, Input Validation, GDPR Compliance, Account Deletion Lifecycle, Privacy Audit Logging |
| **External APIs** | Google Calendar API, Google Gemini API, USDA FoodData Central API, Open-Meteo Weather API, Spotify API, Nominatim / OpenStreetMap, Google OAuth2 |
| **DevOps & Infra** | Vercel (Serverless Deployment), Git, Supabase CLI, Vite, npm |
| **Testing** | Vitest, Unit Testing, Integration Testing, Mocking |
| **Architecture** | Modular Monolith, Domain-Driven Design, Server-Side Rendering, API-First Design, Multi-Tenant, Caching (in-memory TTL), Fallback/Retry Patterns |
| **Geospatial** | PostGIS, EWKB Decoding, Haversine Formula, Geofencing, Reverse Geocoding, Coordinate Systems |
| **Other** | Internationalization (i18n), Localization (l10n), Accessibility (A11y), SEO, Web Audio API, Text-to-Speech (TTS), Speech-to-Text (STT), Multimodal AI Input (image + audio + text) |

## Technical Challenges

### AI Tool-Calling with Row-Level Scoping

The dashboard has a conversational AI assistant that can answer questions like "what was my heaviest bench press this month?" To do this, I built a multi-turn function-calling loop where Gemini issues `query_supabase` tool calls, and the server executes them with automatic user-scoped filtering. The hard part was security: I had to build a table allowlist (10 tables across 4 scoping categories — direct user-scoped, join user-scoped, mixed-scope, and global-read), reserve `user_id` columns from AI manipulation, enforce query limits (max 100 rows, max 3 filters), and handle join-scoped tables differently (e.g., `workout_sets` scopes through `workout_sessions.user_id` via an `!inner` join). The loop caps at 3 turns to prevent runaway API costs.

### Multi-Model Fallback Resilience

Gemini models have variable availability — Flash might return 429 while Pro is fine, or vice versa. I built a cascading fallback chain across 5 model variants (`gemini-3.1-flash-lite` → `gemini-3-flash-preview` → `gemini-2.5-pro` → `gemini-2.5-flash` → `gemini-2.5-flash-lite`). The engine differentiates retryable errors (429, 503, 500) from fatal ones (400, 403) and emits real-time LLM status events (`calling`, `success`, `error`, `exhausted`) so the UI can show which model is being attempted. Every domain module (nutrition, workouts, language, jobs, media, activity) inherits this resilience automatically through the shared `executeFallbackChain()`. A custom `AiError` class preserves HTTP status, parsed error body, and the model name for debugging.

### Multimodal Nutrition Analysis with Structured Output

Users can log food via text description, food photo, or nutrition label photo. The AI must return precise JSON with 30+ nutrient keys matching an internal schema, confidence levels per nutrient, and dietary warnings. The challenge was reliability: LLMs frequently return malformed JSON, extra commentary, or hallucinated nutrient keys. I solved this with a multi-layer approach — `responseMimeType: 'application/json'` for format enforcement, a `sanitizeResult()` layer that validates each key against `ALL_NUTRIENTS` and rejects non-numeric or negative values, automatic retry with a stricter prompt on parse failure (temperature dropped to 0), and rounding to prevent floating-point noise. The USDA FoodData Central integration serves as a ground-truth fallback, mapping 35+ USDA nutrient IDs to internal keys.

### Google Calendar OAuth Token Lifecycle

The Calendar integration needs to handle token refresh transparently across multiple users. Google OAuth tokens expire in 1 hour, and when the Google Cloud app is in "Testing" mode, refresh tokens expire after 7 days. I built a `refreshAccessTokenIfExpired()` layer with a 5-minute expiry buffer that automatically rotates tokens, persists new credentials (including new refresh tokens Google occasionally returns), and detects the `invalid_grant` edge case with a diagnostic hint pointing to the Testing→Production migration. This pattern extends to Spotify OAuth as well. Credential storage uses a dedicated `credentials` table with per-user isolation.

### PostGIS Geospatial Pipeline

Location logs store coordinates as PostGIS geography columns (EWKB binary format). On the server, I decode the hex string into lat/lng by reading the endianness byte (offset 0), then extracting two Float64 values at byte offsets 9 (longitude) and 17 (latitude) using `DataView`. These coordinates feed into a Haversine distance function for geofence proximity detection, reverse geocoding via Nominatim for place names, and weather lookups via Open-Meteo with a 15-minute TTL cache keyed by coordinates rounded to 3 decimal places (~110m precision).

### Job Posting AI Pipeline Reliability

The job tracker needs to extract structured data from wildly inconsistent raw job postings. I built a multi-stage pipeline: `cleanJsonResponse()` strips markdown fences and isolates the root JSON structure between first `{` and last `}`, `parseJobAiJson()` handles parse failures with fallback objects, and `normalizeJobDraft()` maps both snake_case and camelCase variants (since LLMs inconsistently switch between them), enforces enum validation on fields like `location_mode` and `job_type`, and safely extracts nested structures like contacts and keywords. The same pattern repeats for `normalizeResumeAnalysis()` (fit scores, bullet rewrites, cover letters) and `normalizeFollowUpDraft()`.

## What I Learned

- **Design for LLM failure, not LLM success.** Every AI feature needs a fallback chain, output sanitization, and a retry strategy. The "happy path" with LLMs is the exception, not the rule.
- **Structured JSON from LLMs is a full engineering problem.** You need schema enforcement, response cleaning, validation against known keys, retry with stricter prompts, and graceful degradation — not just "parse the response."
- **Scoping AI database access is non-trivial.** Letting an LLM query your database sounds simple until you need table allowlists, column reservation, join-aware scoping, and query limits to prevent data leakage and runaway costs.
- **OAuth token management is a hidden complexity multiplier.** Every third-party integration (Google Calendar, Spotify) brings its own token expiry model, refresh semantics, and failure modes that compound across the system.
- **Cross-domain data aggregation reveals insights that siloed apps never can.** The real value isn't any single module — it's the AI's ability to reason across workout history, nutrition logs, and calendar events simultaneously.
- **Prompt engineering is a design discipline, not a hack.** Each AI module has a carefully crafted persona (Tough-Love Trainer, Supportive Polyglot, Intelligent Strength Coach, Agentic Life Strategist) that shapes output quality as much as the technical constraints do.
- **Multi-tenant data isolation requires defense in depth.** Session auth, RLS policies, server-side user scoping on every query, and AI tool-call scoping all work together — no single layer is sufficient.
