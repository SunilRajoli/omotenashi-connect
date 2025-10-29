import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt.js';
import { ApiError } from '../utils/http.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return next(new ApiError(401, 'Missing bearer token'));
  try {
    const payload = verifyAccess(token);
    (req as any).user = payload; // { sub, role? }
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

export function requireRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user as { role?: string };
    if (!user?.role || !roles.includes(user.role)) {
      return next(new ApiError(403, 'Forbidden'));
    }
    next();
  };
}
