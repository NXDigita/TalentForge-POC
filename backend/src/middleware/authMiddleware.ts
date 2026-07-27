import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface User {
      userId?: string;
      id?: string;
      [key: string]: any;
    }
  }
}

export type AuthenticatedRequest = Request;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'secret');
    req.user = payload as Express.User;
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export const requireAuth = authMiddleware;
