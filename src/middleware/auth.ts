import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    role?: string;
  };
}

/**
 * Parses a Supabase or standard JWT without crashing if offline
 */
function parseJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const payload = parseJwtPayload(token);
    if (payload && (payload.sub || payload.id)) {
      req.user = {
        uid: payload.sub || payload.id,
        email: payload.email,
        name: payload.user_metadata?.full_name || payload.name,
        role: payload.role,
      };
    }
  } catch (error) {
    // Non-blocking for optional auth
  }
  next();
};

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing Supabase token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const payload = parseJwtPayload(token);
    if (payload && (payload.sub || payload.id)) {
      req.user = {
        uid: payload.sub || payload.id,
        email: payload.email,
        name: payload.user_metadata?.full_name || payload.name,
        role: payload.role,
      };
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid Supabase token payload' });
  } catch (error) {
    console.error('Error verifying Supabase token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
