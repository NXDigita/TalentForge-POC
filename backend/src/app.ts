import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import passport from 'passport';
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

const basePort = parseInt(process.env.PORT ?? '5000', 10);
const portOptions = [basePort, basePort + 1, basePort + 2];

function startServer(index = 0) {
  const port = portOptions[index];
  const server = app.listen(port, () => {
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
