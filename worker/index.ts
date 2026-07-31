import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth';
import { scheduleRoutes } from './routes/schedules';
import { clashRoutes } from './routes/clash';
import { notificationRoutes } from './routes/notifications';
import { feedbackRoutes } from './routes/feedback';
import { registrationRoutes } from './routes/registrations';
import { fileRoutes } from './routes/files';

// --- Cloudflare Bindings ---
export type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  FILES: R2Bucket;
  AI: Ai;
  JWT_SECRET: string;
  ENVIRONMENT: string;
  VERSION: string;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
};

// --- Hono App ---
const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

// CORS
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:8787', 'https://jkm-timetables.pages.dev'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', env: c.env.ENVIRONMENT }));

// Version endpoint (for frontend auto-updater)
app.get('/version', (c) => c.json({
  version: c.env.VERSION || '1.0.0',
  env: c.env.ENVIRONMENT,
  deployed: Math.floor(Date.now() / 1000),
}));

// Mount route groups
app.route('/auth', authRoutes);
app.route('/schedules', scheduleRoutes);
app.route('/clash', clashRoutes);
app.route('/notifications', notificationRoutes);
app.route('/feedback', feedbackRoutes);
app.route('/registrations', registrationRoutes);
app.route('/files', fileRoutes);

// --- Hono RPC export ---
export type AppType = typeof app;

// --- Worker entry ---
export default {
  fetch: app.fetch,
};
