Purpose: Give this entire markdown to Google Antigravity (or equivalent AI development agent) and instruct it to design, build, and deliver features for VibeNotes. This is an end-to-end brief: roadmap, UI wireframes, API design (AI/editor/search), marketing site, and final AI/LLM feature (LLM work will be the last phase). Update the website and UI where needed. Use existing /docs folder and enforce project rules (coding-rules.md, naming-conventions.md, design-system.md, .cursorrules) and the brand screenshot at:
/mnt/data/A_flat_digital_vector_graphic_design_features_the_.png (use this file as the hero screenshot on the marketing page).

INSTRUCTIONS (Global)

Read and internalize every file in /docs (prd.md, architecture.md, schema.md, api-spec.md, ui-ux.md, tasks.md, tests.md, system-prompt.md, coding-rules.md, naming-conventions.md, error-handling-guidelines.md, design-system.md). Use them as the single source of truth.

UI library: use shadcn/ui + Tailwind CSS exclusively for all frontend components. Enforce .cursorrules.

Tech stack (default): React + Vite + TypeScript frontend; Node.js + Express (TypeScript) backend; PostgreSQL (Prisma) or Supabase; Dexie for IndexedDB offline; Vitest + Playwright for tests; Vercel (frontend) + Render/Railway (backend) for deploy. If you propose deviations, justify them in one line.

Deliver everything in small atomic PRs (scaffold → features → tests → e2e → deploy). Each PR must include changelog, files changed list, and tests passing.

Follow coding rules: strict TypeScript, tests for every feature, accessibility, no inline secrets, theme tokens usage.

1 — Feature Roadmap (MVP → v1 → v2 → PRO)
MVP (Target: minimal viable product — 2–4 weeks)

Auth (email/password or Supabase magic link)

Notes CRUD (title + markdown content)

Basic Markdown editor with preview (textarea + live preview)

Tags & simple tag filter

Local persistence (IndexedDB via Dexie)

Online sync (queue + flush + optimistic updates)

Note list (virtualized)

Search (basic full-text on backend)

Responsive UI (desktop + mobile)

Comments & Mentions

Shared notebooks & granular permissions

Integrations: Google Drive, Zapier webhooks

Tasks & reminders (integration with calendar)

Mobile wrappers (Capacitor / React Native Web)

Search indexing improvements (full-text ranking, highlight)

Acceptance: Team sharing flows tested; collaboration latency < 2s for edits.

PRO (Monetization + Enterprise — ongoing)

End-to-end encryption (client-side crypto)

Advanced AI features (summaries, Q&A, auto-tagging, rewriter) — see section 6

Unlimited storage & attachment quotas

SSO (SAML / OAuth for enterprise)

Audit logs, admin console, billing, enterprise dashboard

Templates marketplace, team roles, workspace management

Acceptance: Enterprise security audit and compliance checklist.

2 — UI Wireframes (text + component mapping)

Provide high-fidelity wireframes (SVG/PNG) and also a text-based component map. Use shadcn components and design tokens.

2.1 App Shell (Desktop)
+---------------------------------------------------------------+
| Topbar: Logo | Search (Command+K) | Global actions | Profile  |
+---------------------------------------------------------------+
| Sidebar (left, 260px): New Note, Notebooks, Tags, Favorites   |
|                                                           ^  |
|                                                           |  |
|                                                           |  |
| Note List (center): search results / list / pinned notes     |
|   - Virtualized list items (title, excerpt, tags, updatedAt) |
| Editor Panel (right): Title input, toolbar (slash/menu),     |
|   markdown editor (block editor) + preview toggle            |
+---------------------------------------------------------------+


Mapping to shadcn:

Sidebar → Sheet/custom Sidebar using Card + Command component for quick actions

NoteList → virtualized List + Card items

Editor → Textarea/TipTap wrapper with toolbar built from Button, DropdownMenu, Tooltip

SaveIndicator → small Badge in top-right of editor

2.2 Mobile

Collapsible sidebar (Sheet), topbar compact, editor full-screen, bottom toolbar for quick actions (New Note, Search, Sync).

2.3 New Features Wireframes

AI Assistant modal: Dialog with prompt input, mode (summary/qa/rewrite) and response pane (collapsible).

Version history: Tabs showing timeline + diff viewer (code block).

Share dialog: Dialog with permission toggles, link, expiration.

Deliverable: SVG/PNG of Desktop + Mobile wireframes and a components mapping JSON.

3 — API Design (high-level + OpenAPI essentials)

Produce OpenAPI v3 spec and server scaffolding for each endpoint with request/response examples and validation.

3.1 Auth
POST /auth/signup
POST /auth/login
POST /auth/magiclink
GET  /auth/me

3.2 Notes
GET  /notes?q=&tag=&notebook=&limit=&offset=
POST /notes
GET  /notes/{id}
PUT  /notes/{id}     // body must contain version for optimistic locking
DELETE /notes/{id}
POST /notes/{id}/attachments -> returns { signedUrl, publicUrl }
GET  /notes/export?format=md|pdf


Note model (JSON)

{
  "id":"uuid",
  "userId":"uuid",
  "title":"string",
  "content":"markdown",
  "blocks": [ /* optional block delta for rich editor */ ],
  "tags":["string"],
  "notebookId":"uuid|null",
  "version": 5,
  "createdAt":"ISODate",
  "updatedAt":"ISODate"
}

3.3 Tags & Notebooks
GET /tags
POST /tags
GET /notebooks
POST /notebooks

3.4 Search
POST /search
Body: { q: string, scope: "title|content|tags", filters: {tags[], dateRange} }
Response: { results: [{id,title,excerpt,score}] }


Implementation notes: use Postgres full-text (tsvector + GIN) or Supabase/Algolia for higher performance.

3.5 Sync & Conflict

/sync/changes POST — client sends queued ops {op, note, tempId, version}; server returns resolved mapping and conflicts (409).

Use version numbers & If-Match header support.

3.6 Admin & Billing (outline)

/admin/users, /billing/plan, webhooks for payment (Stripe).

4 — API Design for AI + Editor + Search (detailed)

These endpoints let backend orchestrate LLM calls and editor features. AI feature will be last phase and requires LLM training/ops.

4.1 AI Orchestration endpoints (proxy pattern)
POST /ai/summarize
Body: { noteIds: [uuid], style: "short|detailed|bullets" }
Response: { summary: string, modelMeta: {model, tokens} }

POST /ai/qa
Body: { noteIds: [uuid], question: string }
Response: { answer: string, sources: [{noteId, excerpt}] }

POST /ai/rewrite
Body: { noteId: uuid, instructions: string }
Response: { rewritten: string, changes: [diff] }

POST /ai/autotag
Body: { noteId: uuid }
Response: { tags: ["ideas","meeting"] }


Security & Rate-limits: queue LLM calls server-side, require auth, per-user rate-limits and token usage accounting. Use provider-agnostic adapters (OpenAI, Anthropic, Vertex AI) and abstract the LLM layer. Persist prompts & outputs for audit & retraining.

4.2 Editor Autosave & Deltas

POST /editor/delta — receives block-level deltas for collaborative editing (CRDT or OT).

GET /editor/state/{noteId} — returns latest block state.

Realtime: provide WebSocket channel /ws/notes/{id} for collaborative edits; fallback polling.

4.3 Search (advanced)

Indexer worker:

Consume note change events.

Normalize markdown → text, extract headings, tasks, code blocks.

Index to Postgres tsvector or external index (Algolia/Meilisearch).

Search endpoint supports ranking, highlighting, and snippet generation.

5 — Marketing Website (update + new pages)

Create /website with static React or plain pre-rendered HTML (one page app) that reflects product features and monetization tiers.

Required pages:

Landing (hero with /mnt/data/A_flat_digital_vector_graphic_design_features_the_.png)

Features (highlight AI, offline, collaboration)

Pricing (Free / Pro / Team)

Docs (auto-generated skeleton)

About / Contact

Changelog / Roadmap

Marketing site requirements:

Use shadcn components + tokens

Clear CTA funnel: Get Started (signup) → Product demo → Pricing

SEO-friendly meta tags

Pre-made screenshots + animated GIF (short demo) — if not available, generate placeholders

“Why VibeNotes” block comparing competitors (Notion/Obsidian/Evernote)

Deliverable: deployable site with preview URL + CI for preview builds.

6 — AI as Final Feature (LLM build/training/deploy) — Work on this last

This feature is explicitly the last phase. It requires planning, training data, monitoring, and ops. Provide it as a separate project with its own milestones.

6.1 Minimum viable AI features (initial)

Summarize single note

Auto-tagging

Q&A over user notes (single-user scope)

Simple rewrite/improve

6.2 Architecture (LLM ops)

Adapter Layer: provider-agnostic interface to call multiple LLMs.

Prompt Store: versioned prompts + templates.

Invoke Layer: queue + retry, rate-limit per-user.

Result Cache: cache repeated queries, TTL.

Audit Log: store prompt, response, cost, tokens.

Privacy: allow user to choose "do not store" outputs; optionally E2E encrypt inputs.

Training/Finetune: collect anonymized user interactions for supervised fine-tuning if the user opts in.

6.3 Data & Labels (for training)

Summaries: pairs (note, summary) — start with synthetic/engineer-curated seed data.

Tags: (note, tags) — auto label from heuristics + manual corrections.

Q&A: (notes collection, Q → A) — use retrieval-augmented generation (RAG) with vector DB (e.g., Pinecone/Weaviate/PGVector).

6.4 Deployment & Monitoring

Deploy model calls through an API Gateway + autoscaling worker pool.

Track cost per call, token usage, latency, error rates.

A/B test generations; keep human-in-the-loop for quality.

Comply with privacy & data retention rules.

Acceptance: Provide LLM plan with sample prompts, data schema for training, and a staging rollout strategy.

7 — Tasks + Acceptance Criteria (how Antigravity should work)

Provide task list and per-task acceptance critera. Produce PRs for each task.

Example Task: Notes CRUD

Deliverables: API endpoints, frontend components, unit tests, e2e tests.
Acceptance: Create -> read -> update -> delete works; offline create syncs to server; version increment on update; Vitest + Playwright green.

Example Task: AI summarize (MVP)

Deliverables: /ai/summarize endpoint, server adapter to chosen LLM, frontend modal to call it, tests for integration (mock LLM).
Acceptance: Summary returns < 200 words, references source notes, UI displays loader + error handling.

8 — Non-functional requirements

Accessibility (WCAG AA) for all core flows.

Performance: note list should render 1k notes fast (virtualization).

Security: sanitize all HTML; rate-limit auth; use HTTPS.

Observability: Sentry + basic metrics.

CI: tests run on PRs; deploy preview per PR.

9 — Deliverables & Output Format (what Antigravity must return)

For every generated artifact return:

PR bundle: list of files + diffs (unified patch).

Runbook: how to run locally + run tests + deploy preview.

Test results: Vitest & Playwright outputs.

Design assets: wireframe images (SVG/PNG) and updated marketing hero using /mnt/data/A_flat_digital_vector_graphic_design_features_the_.png.

LLM plan: final AI feature spec (prompts, data schema, rollout plan).

10 — Priorities & Timeline (suggested)

Week 0: Repo scaffold, CI, theme + shadcn setup, basic pages + marketing landing.

Week 1–3 (MVP): Auth, Notes CRUD, Editor (markdown), local persistence, sync, search basic.

Week 4–7 (v1): Attachments, autosave UI + templates + export + analytics.

Week 8–12 (v2): Collaboration, comments, shared notebooks, enhanced search.

Week 12+ (PRO): E2E encryption + AI features & enterprise features.

Adjust timeline for team size; provide time estimates in PRs.

11 — Final notes to the Agent

Work incrementally. After each major PR, deploy a preview and run the tests.

Keep the UI consistent with /docs/design-system.md and enforce .cursorrules.

The AI/LLM features are complex and require a dedicated planning sprint — do them last after product stability and telemetry are in place. They require dataset collection, prompt design, provider evaluation, and ops for deployment.

Use /mnt/data/A_flat_digital_vector_graphic_design_features_the_.png as the hero screenshot on the marketing website (convert to optimized web formats when building).