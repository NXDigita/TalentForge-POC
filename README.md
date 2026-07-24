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

## 📁 Monorepo Architecture

```
TalentForge-POC/
├── backend/                  # Express.js + Prisma ORM + Socket.io + Sentry (Port 5001)
│   ├── prisma/
│   │   ├── schema.prisma     # User, Problem, Submission, Badge schema
│   │   └── seed.ts           # Dummy user seeding script
│   └── src/
│       ├── routes/           # Auth, Student, Internal routes
│       └── app.ts            # Server entry point + Redis Socket adapter + Sentry
├── frontend/                 # React 18 + Vite + TypeScript Client (Port 5173)
│   └── src/
│       ├── components/       # ResultsPanel, ScoreRing, TestCaseTable, LLMFeedbackPanel, AppShell
│       ├── context/          # AuthContext, ThemeContext
│       ├── hooks/            # useGradingSocket hook
│       └── pages/            # Dashboard, ProblemBoard, ProblemDetail, Leaderboard, Submissions, Profile, Guide
├── worker/                   # BullMQ Sandboxed Autograder & Container Runner
│   └── src/
│       └── grader/           # correctness.ts, complexity.ts, style.ts, precheck.ts
├── load-test/                # Artillery 20-concurrent submission load test (p95 < 5s)
├── sandbox/                  # Joint E2E 10-canned solutions test matrix
└── docker-compose.yml        # PostgreSQL (5439), Redis (6380), MinIO (9000)
```

---

## ✨ Implemented Core Features

1. **Security Precheck Blocklist (`precheck.ts`)**:
   - Pre-run AST / regex scanner blocking restricted calls pre-execution:
     - **Python**: `subprocess`, `os.system`, `eval(`, `exec(`, `__import__`, `open(`
     - **JavaScript**: `child_process`, `fs`, `eval(`, `process.exit`
     - **Java**: `Runtime.getRuntime`, `ProcessBuilder`, `System.exit`
   - Immediately sets status to `BLOCKED`.

2. **Scaling Ratio Complexity Grader (`complexity.ts`)**:
   - Executes code across scaled input sizes ($N, 2N, 4N$).
   - Fits growth ratios $R_1 = T(2N)/T(N)$ and $R_2 = T(4N)/T(2N)$ to classify Big-O complexity ($O(1)$, $O(N)$, $O(N \log N)$, $O(N^2)$) vs `expectedComplexity`.

3. **In-Container Code Quality Linter (`style.ts`)**:
   - Parses `pylint` (Python), `eslint` (JavaScript), and `checkstyle` (Java) output inside containers to calculate a 0–100 code style sub-score.

4. **Weighted Composite Score & Event Emission**:
   - $\text{Composite Score} = 0.60 \cdot \text{correctness} + 0.30 \cdot \text{complexity} + 0.10 \cdot \text{style}$.
   - Emits real-time `grading:complete` event payload via `@socket.io/redis-emitter`.

5. **Submission History & Score Trend Sparkline (`Submissions.tsx`)**:
   - Interactive SVG score trajectory graph plotting candidate performance over time.
   - Attempts table with status badges (`COMPLETED`, `QUEUED`, `RUNNING`, `FAILED`, `BLOCKED`) and past-result detail modal.
   - Live server resubmit cooldown chip (`nextAllowedAt`).

6. **9-Tab Candidate Profile & Portfolio Manager (`Profile.tsx`)**:
   - **Personal**: Photo avatar uploader, Full Name (`*`), Email (Read-Only `*`), Mobile, DOB, Gender, Country (`*`), State, City.
   - **Academic**: College (`*`), Degree (`*`), Department (`CSE`/`ECE`/`IT`/`EEE`, `*`), Year of Study (`*`), Graduation Year (`*`), Student ID, CGPA.
   - **Skills**: Interactive tech stack chips with proficiency levels and add/remove actions.
   - **Achievements**: Competitive coding contest ranks (LeetCode, CodeChef) and certifications.
   - **Resume**: Drag & drop PDF/Docx upload dropzone with 94% ATS compatibility score preview.
   - **Social Links**: GitHub, LinkedIn, Portfolio, LeetCode, CodeChef.
   - **Blockchain Credentials**: Polygon Amoy testnet ERC-721 NFT badges with PolygonScan verification links.
   - **Privacy & Security**: Password update form and 2FA settings.
   - **Preferences**: Recruiter visibility toggle, PlayStation Dark/Light theme toggles.

7. **API-Driven Paginated Leaderboard (`Leaderboard.tsx`)**:
   - Top 3 Podium Cards (Rank 1 center gold card with glowing border, Rank 2 left silver card, Rank 3 card with `YOU` badge).
   - Candidate rankings table with 7-day score trends (`+45` green / `-3` red) and pass rate progress bars.

8. **Resilient BullMQ Tuning & Sentry Observability**:
   - `stalledInterval: 15_000` ms with `maxStalledCount: 2`.
   - Selective retry policy: Candidate user errors fail fast with 0 retries; Infra errors retry $\times 2$.
   - `@sentry/node` integration in backend and worker services.

---

## 📡 Key API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticates candidate and returns JWT access + refresh tokens | No |
| `POST` | `/api/auth/register` | Registers new candidate account | No |
| `GET` | `/api/auth/me` | Retrieves current candidate profile | Yes |
| `GET` | `/api/students/problems` | Queries problem catalog (hidden test cases excluded) | No |
| `GET` | `/api/students/problems/:slug` | Retrieves single problem details | No |
| `GET` | `/api/students/leaderboard` | Returns paginated candidate rankings and podium data | Yes |
| `GET` | `/api/students/submissions` | Returns candidate submission attempt history | Yes |
| `POST` | `/api/students/problems/:id/submit` | Enqueues code submission and returns `nextAllowedAt` cooldown | Yes |
| `POST` | `/api/students/feedback/format` | Formats candidate performance into 3 AI coaching bullets | No |
