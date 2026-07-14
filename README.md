# TalentForge POC

TalentForge is a premium, performance-verified talent marketplace for engineering students. It replaces generic resumes with verified code proofs evaluated through high-fidelity sandbox simulations, automated behavioral psychometrics, expert human code reviews, and Polygon blockchain-verified ERC-721 badges.

---

## 📁 Repository Structure

This project is structured as an npm monorepo containing the following workspaces:

* **[backend/](file:///c:/Users/tkart/Dev/talentForge/poc/backend)** - Express + TypeScript + Prisma API endpoint router.
* **[frontend/](file:///c:/Users/tkart/Dev/talentForge/poc/frontend)** - React 18 + Vite + TS client interface styled with the PlayStation design language.
* **[worker/](file:///c:/Users/tkart/Dev/talentForge/poc/worker)** - Sandbox job worker managing code compiler runs and autograde evaluations.
* **[docs/](file:///c:/Users/tkart/Dev/talentForge/poc/docs)** - Project requirements and implementation planning.
* **[smart-contracts/](file:///c:/Users/tkart/Dev/talentForge/poc/smart-contracts)** - Solidity ERC-721 badge smart contract and deployment scripts.

---

## 🛠️ Tech Stack & Services

1. **Database:** PostgreSQL (for relational data like users, submissions, and badges).
2. **Key-Value Store:** Redis (for session cache and JWT refresh token storage).
3. **Queue Manager:** BullMQ (managing sandbox execution jobs distributed to workers).
4. **File Storage:** MinIO S3-compatible storage (storing candidate code submissions).
5. **Autograder:** Isolator sandbox environments verifying correctness and Big O complex-time ratios.
6. **Blockchain:** Polygon (Mumbai / Amoy testnet standard) issuing verification credentials.

---

## ⚙️ Initial Setup

### 1. Install Dependencies
Run the following at the monorepo root to install all workspace packages:
```bash
npm install
```

### 2. Configure Environment Variables
Verify or adjust the `.env` settings created in the workspace roots:
* **Root `.env`**: Sets up container passwords for PostgreSQL, Redis, and MinIO.
* **`backend/.env`**: Configures database urls (`DATABASE_URL`), Redis clients (`REDIS_URL`), and authentication secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`).
* **`frontend/.env`**: Sets up the backend API base url (`VITE_API_URL`) and mock worker toggle flags.

### 3. Spin Up Docker Containers
Boot PostgreSQL, Redis, and MinIO local services:
```bash
docker compose up -d
```

### 4. Run Database Migrations
Initialize database tables and relations by applying the Prisma schema inside the `backend/` folder:
```bash
cd backend
npx prisma migrate dev --name init
```

---

## 🚀 Running Dev Environments

To run all components concurrently during development, start their respective workspace runners from the root directory:

### Run Job Workers
```bash
npm run dev:worker
```

### Run Express Backend
```bash
npm run dev:backend
```

### Run React Client
```bash
npm run dev:frontend
```

Once running, access the local client at `http://localhost:5173/`.

---

## ✨ Implemented Features

* **PlayStation Design Language:** High-fidelity landing page with dynamic Light / Dark toggles, pill-style inputs, 8px-radius cards, and a smooth cross-fade Hero Slideshow carousel.
* **Stakeholder Value Matrix:** Fully populated copy detailing candidate skills proof, HOD department analytics, and recruiter matching features.
* **Google OAuth & Token Rotation:** Secure register/login strategy with auto-renew refresh tokens stored in Redis.
* **Verified Badges:** Standard ERC-721 smart contract layout ready to deploy for verified test grades.
