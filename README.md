# TalentForge POC

Proof of concept for a performance-verified talent marketplace for engineering students.

## Structure

- `backend/` - Node.js + Express API with PostgreSQL + Redis
- `frontend/` - React + Vite UI with Monaco editor integration
- `sandbox/` - Docker runner and sandbox templates for code/netlist execution
- `smart-contracts/` - ERC-721 badge contract and deployment scripts
- `docs/` - project requirements and implementation planning

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run backend:
   ```bash
   npm run dev:backend
   ```

   If port 5000 is in use, start on a different port:
   ```bash
   PORT=5001 npm run dev:backend
   ```

   On Windows PowerShell:
   ```powershell
   $env:PORT=5001; npm run dev:backend
   ```

3. Run frontend:
   ```bash
   npm run dev:frontend
   ```

## Notes

- Use `backend/.env` to configure PostgreSQL, Redis, JWT, and S3.
- Use `frontend/.env` for API base URLs and auth settings.
- Use `smart-contracts/.env` for Polygon network settings.
