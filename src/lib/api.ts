import { hc } from 'hono/client';
import type { AppType } from '../api';

// Create the RPC client
// In development, it points to the same origin
export const client = hc<AppType>('/');
