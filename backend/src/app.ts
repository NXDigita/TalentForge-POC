import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import passport from 'passport';
import http from 'http';
import { Server } from 'socket.io';
import './config/passport'; // Load Google strategy configuration
import authRoutes from './routes/auth';
import studentRoutes from './routes/student';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Wrap Express with HTTP Server for Socket.io binding
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

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

const basePort = parseInt(process.env.PORT ?? '5000', 10);
const portOptions = [basePort, basePort + 1, basePort + 2];

function startServer(index = 0) {
  const port = portOptions[index];
  
  // Boot the http server mapping the socket connections
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

startServer();
