# Portfolio — "The Pipeline"

Build guide for Sravan Ravula's personal portfolio site. A CI/CD-pipeline-themed,
dual-mode (Fun / Boring) site. **Frontend only — no backend, no database.** Deploy on Vercel.

> This doc lives in `_docs/` for now. A dedicated repo will be created later; copy this
> guide in as the spec and build the code there.

---

## 1. Goals & constraints

| Item | Decision |
|---|---|
| Theme | Career rendered as a CI/CD deploy pipeline |
| Modes | **Fun** (animated + click-to-play voice) and **Boring** (clean, explanatory, no audio) |
| Backend / DB | **None.** Static frontend only |
| Audio | Static `.mp3` files in `/public`, played client-side on click |
| Hosting | Vercel (static / SSG) |
| Source of truth | Single typed content file; both modes render from it |
| Résumé link | "Download résumé (PDF)" always visible (ship the existing PDF in `/public`) |

---

## 2. Concept

The career is a pipeline that "runs" on load — stages light up left → right like a real deploy,
then the three projects deploy in parallel off production.

```
main branch:
[ Education ]──[ Accenture ]──[ UPMC ]──[ Citrix ●live ]──┬──[ Byte AI ]
  build/compile   deploy v1     deploy v2  running in prod │   (parallel deploys)
                                                           ├──[ Infinity Finances ]
                                                           └──[ TrueSpend · co-founder ]
```

- **Fun mode:** animated pipeline, playful copy, each node has a ▶ button to play Sravan's
  voice explaining that stage. Click-to-play only — never autoplay.
- **Boring mode:** same pipeline, calmer palette, each node opens clean explanatory text
  (what it is, what I did, tech stack + why). No audio.

---

## 3. Tech stack (frontend only)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript, static export | Known stack; SEO for boring mode |
| Styling / motion | Tailwind CSS + Framer Motion | Known stack; drives pipeline animation |
| Pipeline graph | React Flow (or custom SVG) | Built for nodes + edges + parallel branches |
| Audio | HTML5 `<audio>` + custom click-to-play (optional wavesurfer.js waveform) | Per-stage, no autoplay |
| State | React context + `localStorage` | Persist Fun/Boring choice |
| Hosting | Vercel | One-click deploy |

No server routes, no API, no DB. All content and audio are static assets.

---

## 4. Suggested project structure

```
/public
  /audio            education.mp3, accenture.mp3, upmc.mp3, citrix.mp3,
                    byteai.mp3, infinity.mp3, truespend.mp3
  resume.pdf
  og-image.png
/src
  /app              page.tsx (entry + pipeline), layout.tsx
  /components       Pipeline.tsx, StageNode.tsx, StagePanel.tsx,
                    ModeToggle.tsx, BoringGate.tsx, AudioPlayer.tsx
  /content          stages.ts   <-- single source of truth
  /lib              mode-context.tsx
```

---

## 5. Content data model

```ts
type Tech = { name: string; why: string };

type Stage = {
  id: string;
  type: 'education' | 'job' | 'project';
  label: string;            // node title
  sublabel?: string;        // title @ company / role
  dates?: string;
  location?: string;
  status: 'success' | 'live' | 'in-progress';
  branch: 'main' | 'projects';
  about: string;            // boring: what it is + what I did
  tech: Tech[];             // tech + why each was chosen
  links?: { label: string; url: string }[];
  fun: {
    script: string;         // what the audio says (also the on-screen fun blurb)
    audioUrl: string;       // /audio/xxx.mp3
    transcript: string;     // always rendered for a11y (== script)
  };
};
```

Boring mode renders `about` + `tech`. Fun mode renders `fun.script` (short) + the ▶ audio,
with `transcript` always visible.

---

## 6. Stage content (seeded from résumé)

> The "why" lines are drafted from the code/résumé — Sravan should confirm/correct them so
> they reflect his real reasoning (must be defensible in interviews).

### ① Education — *build / compile*
- **Dates:** M.S. EE, Univ. of Missouri–Kansas City (2015–16); B.S. Electronics, KL University (2011–15)
- **About:** Started in electrical/electronics engineering, then moved into software — a systems
  and math foundation carried into cloud and backend work.
- **Fun (~20s):** "I actually started in electrical engineering — circuits, not code. Turns out
  debugging software beats debugging a soldered board at 2am. This is where I got *compiled*
  before I ever compiled anything."

### ② Accenture — *deploy v1*
- **Role:** Full-Stack .NET Web Developer · 2017 · Washington, DC · HMS medical-claims review
- **About:** Built distributed services and internal desktop tools for government healthcare
  claims processing; optimized SQL Server stored procedures by 75%.
- **Tech (why):**
  - C# / .NET — enterprise standard
  - WCF / SOAP — contract-based reliable service comms (the era's norm)
  - WPF + MVVM — rich internal desktop apps, clean separation
  - jQuery / AJAX — dynamic UI
  - InRule — externalize claim rules so analysts change logic without redeploys
  - SQL Server — relational data + stored-proc tuning
- **Fun (~25s):** "My first real prod deploy. Government healthcare claims — very serious, very
  SOAP-XML. I made the database queries 75% faster, which sounds boring until you realize people
  were staring at loading screens all day."

### ③ UPMC Health Plan — *deploy v2*
- **Role:** Senior Full-Stack .NET Web Developer · 2018 – Sep 2025 · Pittsburgh · HealthPlanet member app
- **About:** 7 years building scalable .NET APIs and front-ends for a healthcare member platform;
  led an on-prem → Azure AI Search migration (>100% faster) and integrated Azure OpenAI for
  natural-language queries.
- **Tech (why):**
  - .NET 8 / ASP.NET Core — high-performance APIs
  - Azure AI Search — replaced slow on-prem search; relevance + scale
  - Azure OpenAI — plain-English queries instead of 40 filters
  - Angular / React / Redux — rich member UIs + predictable state
  - Redis — cache hot data
  - NServiceBus + RabbitMQ / MSMQ — reliable async messaging between services
  - SQL Server + Cosmos DB — relational + flexible/distributed data
  - Azure DevOps CI/CD — automated builds (−40% deploy time)
  - Solr on OpenShift / Docker — distributed search; microservices + multi-client SaaS
- **Fun (~30s):** "Seven years — this is where I grew up as an engineer. Highlight: I ripped out a
  painfully slow search system and rebuilt it on Azure AI Search, more than doubled the speed.
  Then plugged in Azure OpenAI so people could just *ask* a question instead of clicking forty filters."

### ④ Citrix — *● running in production* (live)
- **Role:** Senior Cloud Development Engineer · Oct 2025 – Present · Fort Lauderdale
- **About:** Multi-cloud (Azure/AWS/GCP) infrastructure for FedRAMP High systems; drove cost
  optimization (VMs → Kubernetes, ~$25K/yr), automated policy + operations (>90% less manual
  work), and built AI tooling for security triage and incident summarization.
- **Tech (why):**
  - Azure / AWS / GCP — multi-cloud platform engineering
  - Kubernetes — cost + scaling over VMs
  - Terraform — repeatable, auditable infra (critical for FedRAMP)
  - C# / PowerShell — Azure automation
  - Azure OpenAI — vuln triage → auto-Jira; ops log summaries to cut toil
  - Splunk Cloud (HEC) — push-based telemetry over pull
  - FedRAMP High — government-grade compliance
- **Fun (~30s):** "Where I am now — and yes, it's literally 'live in production.' I work across all
  three big clouds on FedRAMP High, which is security on hard mode. Saved ~$25K a year moving
  workloads to Kubernetes, and built an AI that reads security bugs and files the Jira ticket to
  the right team so a human doesn't have to."

### ⑤ Byte AI — *parallel deploy* (solo)
- **Meta:** iOS + web · ~50 daily active users · [byteaiofficial.com](https://www.byteaiofficial.com) ·
  [App Store](https://apps.apple.com/us/app/byteaiofficial/id6764432542)
- **About:** A tech-focused social platform built end-to-end — backend, web, and native iOS — with
  semantic search and AI content features.
- **Tech (why):**
  - .NET 9 — core strength
  - Next.js / React — fast, SEO-friendly web
  - SwiftUI — native iOS feel
  - Supabase / Postgres — auth + DB + storage in one; ship fast solo
  - pgvector — vectors live in the same DB, no separate vector store to run
  - Self-hosted ONNX embeddings (nomic-embed-text) — no per-call API cost at scale
  - Reciprocal Rank Fusion — blend keyword + semantic for better relevance
  - Gemini — cheap/fast tagging, quality scoring, moderation
  - SignalR — real-time chat in the .NET stack
  - APNs · Azure · GitHub Actions (blue-green) — push + deploy
- **Fun (~30s):** "This one's my baby — a social app for devs, 50 people show up every day. The
  search actually understands *meaning*, not just keywords: I run the AI embedding model myself so
  it's basically free, then blend it with classic text search. Backend, website, iPhone app — all me."

### ⑥ Infinity Finances — *parallel deploy* (solo)
- **Meta:** live web · [firecalculator-app.vercel.app](https://firecalculator-app.vercel.app)
- **About:** A financial-independence/retirement (FIRE) planning platform with a month-by-month
  portfolio simulation engine and an AI assistant for data entry.
- **Tech (why):**
  - Next.js / React — interactive calculators
  - Hono API — ultra-light, fast TS backend; quick cold starts on Railway
  - Supabase — persistence / auth
  - Recharts — projection charts
  - Gemini (structured extraction) — describe finances in plain English vs 30 form fields
  - Vercel + Railway — hosting
- **Fun (~25s):** "A retirement calculator that won't put you to sleep. You can *talk* to it — 'I make
  X, spend Y' — and AI fills the form. Under the hood it simulates your money month-by-month for
  50 years, tax stuff included."

### ⑦ TrueSpend — *parallel deploy* (co-founder)
- **Meta:** in development, iOS TestFlight · [truespend.org](https://www.truespend.org)
- **About:** A geo-aware app that recommends the best rewards credit card the moment you arrive at a
  store. Co-founded; currently in development.
- **Tech (why):**
  - React Native + Expo — one codebase, iOS + Android
  - .NET 9 — backend strength
  - Geofencing / iOS CLVisit + Android fused location — battery-efficient arrival detection
  - Plaid — real transaction data
  - Stripe — subscriptions, 3-tier billing
  - Azure OpenAI (nightly batch) — insights without realtime AI cost
  - Azure Container Apps + Terraform — scalable, IaC
  - Supabase / Redis — data + cache
- **Fun (~30s):** "Co-founded this one. Your phone notices you walked into a store and instantly
  tells you which card to swipe for the most rewards. It's smart about location so it doesn't kill
  your battery, pulls real transactions through Plaid, and an AI gives you nightly tips on rewards
  you're missing."

---

## 7. Interaction design

### Entry splash — two doors
On first load, show two choices:
- **"Show me the fun version"** → Fun mode.
- **"Keep it simple (I'm a recruiter)"** → triggers the Boring Gate (below).

Persist the choice in `localStorage`; a small corner toggle lets users switch anytime.

### The "Boring" gate — 5-second playful resistance
When the user clicks the Boring option, don't navigate immediately. Show **one prompt per second
for 5 seconds**, escalating, then enable entry. Keep it light — the messages are the joke, so the
wait feels intentional, not broken.

| Second | Prompt |
|---|---|
| 1 | "Are you sure?" |
| 2 | "Come on, live a little 😏" |
| 3 | "The fun version is *right there*…" |
| 4 | "Okay okay, almost there…" |
| 5 | "Fine. Click me." → button becomes active |

Implementation notes:
- Button is disabled (or playfully dodges) for seconds 1–4; on second 5 it enables and the label
  becomes "Enter boring mode."
- Respect `prefers-reduced-motion`: still show the prompts, just no dodge animation.
- One escape hatch: the Fun option stays clickable the whole time.

### Fun mode
- Pipeline animates on load (sequential "deploy" light-up; the three project lanes deploy in parallel).
- Citrix node shows a pulsing green "live" dot.
- Click a node → panel with `fun.script` blurb + **▶ "Hear me explain this"** (click-to-play),
  optional waveform, and the transcript always visible.
- Confetti when the last project "deploys."
- Easter eggs (optional): Konami code, a `sudo hire-me` toast.

### Boring mode
- Same pipeline, calmer palette, minimal motion.
- Click a node → clean panel: `about` + a tech table (name + why). No audio.
- Always-visible **"Download résumé (PDF)"** button → `/resume.pdf`.

### Audio component rules
- Never autoplay. One clip plays at a time (starting one stops others).
- Always render the transcript next to the player (accessibility + on-mute browsing).
- Keep clips 15–30s.

### Mobile
- Pipeline rotates to a vertical scroll; nodes stack; tap to expand a stage.

### Accessibility / SEO
- `prefers-reduced-motion` fallback for all animation.
- Semantic HTML + real text in boring mode so it indexes well.
- Keyboard navigable nodes and panels; captions/transcripts for audio.

---

## 8. Build phases

| Phase | Deliverable |
|---|---|
| 1. Scaffold | Next.js + `stages.ts` (all 7 stages, both modes) + basic vertical pipeline + mode toggle. Usable résumé site. |
| 2. Visualize | React Flow / SVG pipeline; sequential deploy animation; parallel project branches; live green node. |
| 3. Audio | Record 7 clips; build click-to-play + transcript component. |
| 4. Delight | Two-door entry + 5s boring gate; confetti; easter eggs; mobile + a11y pass. |
| 5. Ship | Vercel deploy + custom domain + analytics + OG share image. |

---

## 9. Deployment (Vercel)

- `next.config.js`: static-friendly (use static export or default SSG — no server routes needed).
- Push repo to GitHub → import in Vercel → deploy. Zero config for a static Next.js app.
- Add custom domain (e.g. `sravanravula.dev`).
- Drop `resume.pdf`, `/audio/*.mp3`, and `og-image.png` in `/public`.

---

## 10. Assets Sravan provides

- **7 audio clips** (15–30s each) — scripts in §6 are ready to read; tweak to voice.
- **Confirm/correct the "why tech" lines** in §6.
- **Domain name.**
- Optional: project screenshots/thumbnails for nodes; a headshot.

---

## 11. Open decisions

- Pipeline orientation: horizontal (desktop) auto-switching to vertical (mobile) — recommended.
- Domain choice.
- React Flow vs hand-rolled SVG for the pipeline (React Flow = faster to build branches).
- Boring-gate label wording / final prompt copy.
