import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import passport from 'passport';
import http from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import './config/passport'; // Load Google strategy configuration
import authRoutes from './routes/auth';
import studentRoutes from './routes/student';
import internalRoutes from './routes/internal';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());
app.use(passport.initialize());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/students', studentRoutes);
app.use('/internal',     internalRoutes);   // worker-only internal endpoints

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ─── HTTP + Socket.io server ─────────────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Redis adapter: allows the worker's @socket.io/redis-emitter to publish
// events into socket.io rooms managed by this server.
async function setupRedisAdapter() {
  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

  const pubClient = createClient({ url: redisUrl });
  const subClient = pubClient.duplicate();

  pubClient.on('error', (err) => console.error('[Redis Pub] Error:', err.message));
  subClient.on('error', (err) => console.error('[Redis Sub] Error:', err.message));

  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
  console.log('Socket.io Redis adapter connected');
}

// Bind socket server to Express app context so controllers can emit events
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected to socket.io:', socket.id);

  // Candidates listen to grading changes by joining room submission:{submissionId}
  socket.on('join_submission', (submissionId: string) => {
    socket.join(`submission:${submissionId}`);
    console.log(`Socket ${socket.id} joined room submission:${submissionId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected from socket.io:', socket.id);
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const basePort    = parseInt(process.env.PORT ?? '5000', 10);
const portOptions = [basePort, basePort + 1, basePort + 2];

function startServer(index = 0) {
  const port = portOptions[index];

  server.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (index < portOptions.length - 1 && (error.code === 'EADDRINUSE' || error.code === 'EACCES')) {
      console.warn(`Port ${port} unavailable (${error.code}). Trying ${portOptions[index + 1]}...`);
      startServer(index + 1);
    } else {
      console.error(`Failed to start backend on port ${port}:`, error.message);
      process.exit(1);
    }
  });
}

setupRedisAdapter()
  .then(() => startServer())
  .catch((err) => {
    console.warn('Redis adapter failed, running without adapter:', err.message);
    startServer();
  });
