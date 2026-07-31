// Hono RPC type export - types are inferred from the Worker backend
// Import the AppType from the worker for RPC type safety
// In dev, this is used by src/lib/api.ts via hc<AppType>

export type { AppType } from '../../worker/index';
