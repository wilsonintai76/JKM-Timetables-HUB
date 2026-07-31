import { Context, Next } from 'hono';
import { Bindings } from '../index';

// Simple JWT payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

// Quick base64url encode/decode (no external deps needed in Workers)
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

export async function signToken(
  payload: Omit<JWTPayload, 'exp'>,
  secret: string,
  expiresInHours = 24
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const fullPayload = { ...payload, exp };

  const encoder = new TextEncoder();
  const data = base64UrlEncode(JSON.stringify(header)) + '.' + base64UrlEncode(JSON.stringify(fullPayload));

  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signature = base64UrlEncode(String.fromCharCode(...new Uint8Array(sig)));

  return data + '.' + signature;
}

export async function verifyToken(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const encoder = new TextEncoder();
    const data = parts[0] + '.' + parts[1];
    const signature = parts[2];

    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sigBytes = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(data));

    if (!valid) return null;

    const payload = JSON.parse(base64UrlDecode(parts[1])) as JWTPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

// Auth middleware - attach user to context
export async function authMiddleware(c: Context<{ Bindings: Bindings; Variables: { user: JWTPayload } }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  c.set('user', payload);
  await next();
}

// Optional auth - doesn't reject but sets user if token present
export async function optionalAuth(c: Context<{ Bindings: Bindings; Variables: { user?: JWTPayload } }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    if (payload) {
      c.set('user', payload);
    }
  }
  await next();
}
