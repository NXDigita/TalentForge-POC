import bcrypt from 'bcrypt';
import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, name, domain } = req.body;
  if (!email || !password || !name || !domain) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), email, name, domain, password: hashedPassword };

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET ?? 'secret', {
    expiresIn: '7d'
  });

  return res.status(201).json({ user: { id: user.id, email, name, domain }, token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET ?? 'secret', {
    expiresIn: '7d'
  });

  return res.status(200).json({ user: { email }, token });
});

export default router;
