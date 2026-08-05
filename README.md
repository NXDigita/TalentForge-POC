# TalentForge — Verified Skill Proof Platform

TalentForge is a performance-verified talent marketplace for engineering students. It replaces generic resumes with verified code proofs evaluated through high-fidelity sandbox simulations, automated behavioral psychometrics, expert human code reviews, and Polygon blockchain-verified ERC-721 badges.

> **Demo POC** — Full RBAC across Student, Reviewer, Employer, and Admin roles with AI-generated problems, real-time grading, and candidate discovery.

---

## 🔑 Login Credentials (All Roles)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student (CSE)** | `tkarthikeyan@gmail.com` | `password123` |
| **Student (ECE)** | `student@college.edu` | `password123` |
| **Senior Reviewer** | `reviewer@talentforge.in` | `Reviewer123!` |
| **Employer / Recruiter** | `employer@talentforge.in` | `password123` |
| **System Admin** | `admin@talentforge.in` | `Admin123!` |

---

## ⚡ Quickstart

### 1. Prerequisites — Docker Infrastructure

Start PostgreSQL, Redis, and MinIO via Docker Compose:

```bash
docker compose up -d
```

| Service | Image | Host Port | Container Port |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | `postgres:16.4-alpine` | `5439` | `5432` |
| **Redis** | `redis:7.2-alpine` | `6380` | `6379` |
| **MinIO (S3)** | `minio/minio` | `9000 / 9001` | `9000 / 9001` |

### 2. Seed Database

Apply Prisma migrations and seed all users + 8 problems (including flagship Load Balancer):

```bash
# From repo root
npm run seed --prefix backend
```

### 3. Launch Development Servers

```bash
# Terminal 1: Express API (Port 5001)
npm run dev:backend

# Terminal 2: BullMQ Grading Worker
npm run dev:worker

# Terminal 3: React + Vite Frontend (Port 5173)
npm run dev:frontend
```

| URL | Description |
| :--- | :--- |
| [http://localhost:5173](http://localhost:5173) | Frontend client |
| [http://localhost:5001](http://localhost:5001) | Backend Express API |
| [http://localhost:5001/health](http://localhost:5001/health) | Health check |
| [http://localhost:9001](http://localhost:9001) | MinIO console (minioadmin / minioadmin_dev_secret) |

---

Co-authored-by: karthikeyant <tkarthikeyan@gmail.com>
Co-authored-by: NXDigita <nxdigita.official@gmail.com>

---

## 📁 Monorepo Architecture

```
TalentForge-POC/
├── backend/                  # Express.js + Prisma ORM + Socket.io + Sentry (Port 5001)
│   ├── prisma/
│   │   ├── schema.prisma     # User, Problem, Submission, Badge, Review, Notification schema
│   │   └── seed.ts           # 8 Problems + 4 user roles seeder
│   └── src/
│       ├── routes/
│       │   ├── auth.ts       # Login, Register, /me, Refresh
│       │   ├── student.ts    # Problems, Submissions, AI Generator, Notifications
│       │   ├── reviews.ts    # Reviewer RBAC queue, Approve/Reject
│       │   ├── employer.ts   # Candidate discovery, Shortlisting
│       │   ├── admin.ts      # Admin operations
│       │   └── verify.ts     # Badge verification + OG image
│       └── app.ts            # Server entry + Redis Socket adapter + Sentry + rate limiting
├── frontend/                 # React 18 + Vite + TypeScript Client (Port 5173)
│   └── src/
│       ├── components/       # AppShell (RBAC nav), CopilotDrawer (Global AI Chat), RequireRole guard
│       ├── context/          # AuthContext (role-aware), ThemeContext
│       ├── pages/
│       │   ├── Home.tsx            # Landing page v1: Hero, How-It-Works, Badge showcase
│       │   ├── Dashboard.tsx       # Student dashboard
│       │   ├── ProblemBoard.tsx    # 8 seeded + AI Problem Generator modal
│       │   ├── ProblemDetail.tsx   # Monaco Editor + AI copilot
│       │   ├── Assessment.tsx      # 20-question psychometric + domain assessments
│       │   ├── Profile.tsx         # Role-tailored profiles (Student/Reviewer/Employer/Admin)
│       │   ├── ReviewerPortal.tsx  # Review queue, Monaco read-only viewer, star rating
│       │   ├── EmployerDiscover.tsx # Candidate discovery with TanStack Table
│       │   ├── EmployerShortlist.tsx# Saved shortlist management
│       │   ├── Leaderboard.tsx     # Ranked podium + trends
│       │   ├── Submissions.tsx     # Attempt history + sparkline
│       │   └── Guide.tsx           # Platform help & architecture guide
│       └── services/
│           └── api.ts        # All API calls including generateAIProblem()
├── worker/                   # BullMQ Sandboxed Autograder & Container Runner
│   └── src/grader/           # correctness.ts, complexity.ts, style.ts, precheck.ts
├── load-test/                # Artillery 20-concurrent submission load test (p95 < 5s)
├── sandbox/                  # E2E 10-canned solutions test matrix
└── docker-compose.yml        # PostgreSQL (5439), Redis (6380), MinIO (9000)
```

---

## 🎭 Role-Based Access Control (RBAC)

TalentForge implements strict RBAC. Each role sees only its authorized screens and navigation.

| Role | Home Route | Access |
| :--- | :--- | :--- |
| **STUDENT** | `/dashboard` | Problems, Submissions, Leaderboard, Assessment, Profile, Guide |
| **REVIEWER** | `/reviewer` | Review Queue, Read-only Monaco Code Viewer, Approve/Reject |
| **EMPLOYER** | `/discover` | Candidate Discovery Table, Shortlist, Profile |
| **ADMIN** | `/admin` | Platform health, all routes |

`RequireRole.tsx` guards enforce role-specific route access. Unauthorized URL navigation redirects to the role's home page.

---

## ✨ Feature Summary

### 🧑‍💻 Student Workflow
- **Problem Board**: 8 seeded engineering challenges (Explorer → Builder → Architect tiers) + AI-generated problems on demand.
- **AI Problem Generator**: Click "✨ Generate AI Problem" to prompt the active AI model adapter (Ollama llama3 / Claude / Gemini) to create a new problem with hidden test cases, then open it in Monaco Editor.
- **Monaco Editor**: Syntax-highlighted code editor with Python/JavaScript/Java language support.
- **AI Copilot**: A globally available AI mentor drawer that streams contextual advice and suggested prompts based on the current page or problem.
- **Sandbox Grading**: BullMQ worker grading with Security Precheck → Correctness → Big-O Complexity → Style score.
- **Real-time Results**: Socket.io live `grading:complete` event → Results panel with score breakdown.
- **Submission Cooldown**: 60-second resubmit lockout with live countdown chip.
- **Leaderboard**: Paginated podium (Gold/Silver/Bronze) with 7-day score trends.
- **Psychometric Assessment**: 20-question behavioral quiz + domain knowledge test with a 5-trait radar chart.
- **GitHub Integration**: Automated fetching of public repos, followers, and account age to calculate a GitHub Score.
- **AI Talent Profile**: A comprehensive 9-tab profile featuring an AI-extracted Skills Radar Chart (powered by pgvector), strengths chips, GitHub/Social links, and a public/private recruiter visibility toggle.

### 🔍 Reviewer Workflow
- **Review Queue**: `GET /reviews/queue` — oldest `AI_VERIFIED` submissions first.
- **Code Viewer**: Read-only Monaco editor with submission code loaded.
- **Evaluation**: Star rating (1–5) + comment + Approve/Reject decision.
- **Outcomes**: APPROVE → `EXPERT_VERIFIED`; REJECT → badge revoked + student notification.

### 🏢 Employer Workflow
- **Candidate Discovery** (`/discover`): TanStack Table with sortable aggregate score, badge toggle, min-score slider, language filter.
- **Candidate Drawer**: Comprehensive Profile (education, social links, verified skills), 4-part Aggregate Score Breakdown Tooltip (Profile 15% + GitHub 10% + Code 50% + Psychometric 25%), Psychometric Radar, best code sample, Shortlist button.
- **Shortlist Page** (`/shortlist`): Saved candidates with remove action.
- **Profile Visibility**: Code samples only shown if `profilePublic=true`.

### 🛡️ Admin Workflow
- **Platform Health Dashboard**: Active users count, daily sandbox executions, S3 backup cron status, AI adapter config.
- **AI Adapter Management**: Runtime switch between Ollama / Claude / Gemini / Mock.

### 🏅 Verification & Badges
- **AI Verified Badge** → Expert Review → `EXPERT_VERIFIED` badge chip flips.
- **LinkedIn Share**: OG image per badge + pre-filled LinkedIn post.
- **Polygon ERC-721**: On-chain skill credentials with PolygonScan verification link.

---

## 🤖 AI Adapter System

TalentForge uses a pluggable AI adapter pattern. Set `AI_PROVIDER` in `backend/.env`:

```env
AI_PROVIDER="ollama"      # Local Ollama (default)
OLLAMA_HOST="http://localhost:11434"
OLLAMA_MODEL="llama3"

# AI_PROVIDER="claude"    # Anthropic Claude
# AI_PROVIDER="gemini"    # Google Gemini
# AI_PROVIDER="mock"      # Deterministic mock (no external dependency)
```

AI is used for:
- **Problem Generation**: `POST /api/students/problems/generate-ai` creates new problems from topics
- **AI Feedback**: `POST /api/students/feedback/format` — 3-bullet coaching bullets
- **AI Copilot**: Monaco sidebar chat for in-editor coding assistance
- **Learning Path**: Personalized study milestones from psychometric results

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Login — returns JWT access + refresh tokens | No |
| `POST` | `/api/auth/register` | Register new account | No |
| `GET` | `/api/auth/me` | Get current user + role | Yes |
| `POST` | `/api/auth/refresh` | Refresh access token | No |

### Student Problems
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/students/problems` | Problem catalog (8 seeded + AI generated) | No |
| `GET` | `/api/students/problems/:slug` | Single problem details (auto-synthesizes AI slugs) | No |
| `POST` | `/api/students/problems/generate-ai` | AI generate new problem with hidden test cases | No |
| `GET` | `/api/students/problems/:id/presigned` | MinIO S3 PUT presigned URL for code upload | Yes |
| `POST` | `/api/students/problems/:id/submit` | Enqueue code submission | Yes |

### Student Data
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/students/submissions` | Submission history + scores | Yes |
| `GET` | `/api/students/leaderboard` | Paginated rankings + podium | Yes |
| `GET` | `/api/students/notifications` | Notification bell — unread count | Yes |
| `POST` | `/api/students/feedback/format` | AI 3-bullet coaching feedback | No |
| `POST` | `/api/students/assessment` | Submit psychometric answers | Yes |
| `GET` | `/api/students/assessment/results/:id` | Get psychometric score + radar | Yes |

### AI Copilot & Embedding
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/copilot/chat` | SSE streaming AI chat with page context injection | Yes |
| `POST` | `/api/internal/embed-profiles` | Extract skills + embed profile text via pgvector | INTERNAL |

### Reviews (Reviewer RBAC)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/reviews/queue` | Queue of AI_VERIFIED submissions (oldest first) | REVIEWER |
| `POST` | `/reviews/:id` | Submit `{stars, comment, verdict: APPROVE/REJECT}` | REVIEWER |

### Employer Discovery
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/candidates` | Discover candidates `?minScore=&badge=&language=` | EMPLOYER |
| `POST` | `/api/shortlist` | Shortlist a candidate | EMPLOYER |
| `DELETE` | `/api/shortlist/:id` | Remove from shortlist | EMPLOYER |

### Verification
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/verify/:id` | Verify badge by ID | No |
| `GET` | `/api/verify/:id/og-image` | SVG OG image for LinkedIn share | No |

---

## 🗄️ 8 Seeded Problems

| # | Title | Tier | Reward | Key Concept |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Two Sum | Explorer | 100 XP | Hash map O(N) |
| 2 | LRU Cache System | Builder | 150 XP | Doubly-linked list + HashMap |
| 3 | Token Bucket Rate Limiter | Builder | 150 XP | Multi-client token refill |
| 4 | **Build a Load Balancer** ⭐ | **Architect** | **250 XP** | **10 hidden test cases: Round-Robin, Weighted, Health-Check Eviction** |
| 5 | LSM-Tree MemTable & SSTable | Architect | 250 XP | Write-ahead log flushing |
| 6 | Distributed Lock Manager | Architect | 250 XP | TTL lease auto-expiration |
| 7 | Trie Autocomplete Engine | Builder | 150 XP | Prefix search O(L) |
| 8 | Consistent Hashing Ring | Architect | 250 XP | Virtual node ring partitioning |

---

## 🔬 Grading Pipeline

```
User submits code
       │
       ▼
[1] Security Precheck (precheck.ts)
    └─ Block: subprocess, eval, Runtime.exec, fs, child_process
       │ BLOCKED → Immediate fail, no container spawned
       │
       ▼
[2] MinIO S3 Upload → BullMQ Enqueue
       │
       ▼
[3] Docker Container Spawn
    ├─ Correctness: run vs public + hidden test cases
    ├─ Complexity: execute at N, 2N, 4N → fit O() class
    └─ Style: pylint / eslint / checkstyle → 0–100
       │
       ▼
[4] Composite Score = 60% Correctness + 30% Complexity + 10% Style
       │
       ▼
[5] Socket.io grading:complete event → Frontend ResultsPanel
       │
       ▼
[6] Score ≥ Threshold → AI_VERIFIED badge
       │
       ▼
[7] Reviewer Queue → APPROVE → EXPERT_VERIFIED + Polygon ERC-721 NFT
                   → REJECT  → Badge revoked + Notification
```

---

## 📊 Platform Health & Observability

- **Sentry**: Error tracking in both `backend` and `worker` services.
- **BullMQ**: `stalledInterval: 15s`, `maxStalledCount: 2`. Candidate errors fail fast (0 retries); infra errors retry ×2.
- **Rate Limiting**: `express-rate-limit` + Redis — 100 req / 15 min on public routes.
- **Nightly Backup**: `pg_dump | gzip | aws s3 cp` with 14-day S3 retention.
- **PG Indexes**: `Badge.status`, `Submission.totalScore` for fast employer discovery queries.
