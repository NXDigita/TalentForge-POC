@echo off

docker compose up -d

timeout /t 5 >nul

start "Backend" cmd /k "npm run dev:backend"
start "Worker" cmd /k "npm run dev:worker"
start "Frontend" cmd /k "npm run dev:frontend"

exit