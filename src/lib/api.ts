import { hc } from 'hono/client';
import type { AppType } from '../api';

// Hono RPC Client - points to Cloudflare Worker API
// In dev (wrangler dev), the worker runs on :8787
// In production, it's the deployed worker URL
const API_BASE = import.meta.env.PROD
  ? 'https://jkm-timetables-hub.wilsonintai76.workers.dev'
  : 'http://localhost:8787';

export const client = hc<AppType>(API_BASE);

// Helper: attach auth token to requests
export function authHeaders(token?: string): Record<string, string> {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
