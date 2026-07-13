import { Router } from 'express';

const router = Router();

router.get('/profile', (req, res) => {
  return res.json({
    id: 'student-1',
    name: 'Student One',
    domain: 'cse',
    tier: 'Explorer',
    xp: 1200,
    badges: []
  });
});

router.get('/problems', (req, res) => {
  return res.json([
    { id: 'p1', title: 'Basic Arrays', tier: 'Explorer', domain: 'cse' },
    { id: 'p2', title: 'SPICE Circuit Validation', tier: 'Explorer', domain: 'ece' }
  ]);
});

export default router;
