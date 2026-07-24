# TalentForge — Verified Skill Proof Platform

TalentForge is a performance-verified talent marketplace for engineering students. It replaces generic resumes with verified code proofs evaluated through high-fidelity sandbox simulations, automated behavioral psychometrics, expert human code reviews, and Polygon blockchain-verified ERC-721 badges.

---

## ⚡ Quickstart

### 1. Prerequisite Containers & Ports
Start PostgreSQL, Redis, and MinIO local infrastructure using Docker Compose:

```bash
docker compose up -d
```

| Service | Container Image | Host Port Mapping | Internal Container Port |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | `postgres:16.4-alpine` | `5439` | `5432` |
| **Redis** | `redis:7.2-alpine` | `6380` | `6379` |
| **MinIO (S3)** | `minio/minio:RELEASE...` | `9000` / `9001` | `9000` / `9001` |

### 2. Seed Pre-configured Dummy Users
Apply Prisma migrations and seed pre-configured student dummy users:

```bash
npm run seed --prefix backend
```

**Seeded Candidate Credentials:**
- **Karthikeyan (CSE)**: `tkarthikeyan@gmail.com` / `password123`
- **Student User (ECE)**: `student@college.edu` / `password123`

### 3. Launch Development Servers

Run backend API server and Vite frontend client concurrently:

```bash
# Terminal 1: Backend Express API (Port 5001)
npm run dev:backend

# Terminal 2: React 18 + Vite Frontend Client (Port 5173)
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)
- **Backend Health Check**: [http://localhost:5001/health](http://localhost:5001/health)

---

## 📁 Monorepo Structure

```
TalentForge-POC/
├── backend/                  # Express.js + Prisma ORM + Socket.io Server (Port 5001)
│   ├── prisma/
│   │   ├── schema.prisma     # User, Problem, Submission, Badge schema
│   │   └── seed.ts           # Dummy user seeding script
│   └── src/
│       ├── routes/           # Auth, Student, Internal routes
│       └── app.ts            # Server entry point + Redis Socket adapter
├── frontend/                 # React 18 + Vite + TypeScript Client (Port 5173)
│   └── src/
│       ├── components/       # ResultsPanel, ScoreRing, TestCaseTable, LLMFeedbackPanel
│       ├── context/          # AuthContext, ThemeContext
│       ├── hooks/            # useGradingSocket hook
│       └── pages/            # Dashboard, ProblemBoard, ProblemDetail, Profile, Guide, NotFound
├── worker/                   # BullMQ Sandboxed Autograder & Code Compiler Runner
└── docker-compose.yml        # PostgreSQL (5439), Redis (6380), MinIO (9000)
```

---

## ✨ Implemented Core Features

1. **Problem Board & Split Workspace**:
   - Card grid layout with domain (`CSE`/`ECE`) and difficulty (`Explorer`, `Apprentice`, `Builder`, `Master`) filters.
   - Resizable horizontal split view (`react-resizable-panels`) with Markdown statements (`react-markdown`) and Monaco Editor (`@monaco-editor/react`).

2. **Real-time Submit UX & Live Status Chips**:
   - Submit button transitions: `Submit Solution` → `Queued...` → `Evaluating...` → `Graded (98/100)`.
   - Custom `useGradingSocket(submissionId)` hook with automatic TanStack Query cache invalidations.

3. **Test-Case Matrix & Output Diff Viewer**:
   - Pass (`CheckCircle2`) and Fail (`XCircle`) status icons.
   - Time (ms) and Memory (MB) metrics per case.
   - Expandable expected vs. actual output diff comparison.

4. **Animated SVG Score Ring**:
   - Smooth SVG radial progress gauge animating from `0` to total verified score with gradient strokes.

5. **State UIs (`COMPILE_ERROR`, `TIMEOUT`, `OOM`)**:
   - Monospace `stderr` block with copy button for compilation failures.
   - Alert banners for `TIMEOUT` (2000ms limit) and `OOM` (256MB limit).

6. **Claude 3.5 LLM Performance Coach**:
   - Composite score gauge (50% correctness + 30% complexity + 20% style).
   - 3 Sub-score progress bars.
   - Live character-by-character typewriter effect for AI coaching recommendations.
   - Controlled by `VITE_FF_LLM_FEEDBACK` feature flag.

7. **Student Dashboard & Candidate Profile**:
   - Dark-mode responsive PlayStation design language cards.
   - Tier XP progress bars, psychometric competency index, and Polygon Amoy testnet ERC-721 NFT badge confirmations.

8. **In-App Guide / Help Center**:
   - Complete platform documentation page (`/guide`) integrated directly into sidebar navigation.

---

## 📡 Key API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticates candidate and returns JWT access + refresh tokens | No |
| `POST` | `/api/auth/register` | Registers new candidate account | No |
| `GET` | `/api/auth/me` | Retrieves current candidate profile | Yes |
| `GET` | `/api/students/problems` | Queries problem catalog (hidden test cases excluded) | No |
| `GET` | `/api/students/problems/:slug` | Retrieves single problem details | No |
| `GET` | `/api/students/problems/:id/presigned` | Generates MinIO presigned upload URL | Yes |
| `POST` | `/api/students/problems/:id/submit` | Enqueues code submission to BullMQ sandbox runner | Yes |
| `POST` | `/api/students/feedback/format` | Formats candidate performance into 3 AI coaching bullets | No |
