import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import api from './src/api/index';

async function startServer() {
  const app = new Hono();
  const PORT = 3000;

  // Mount the API
  app.route('/', api);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    // Use Vite's connect instance as middleware
    app.use('*', async (c, next) => {
      const viteMiddleware = vite.middlewares;
      return new Promise((resolve) => {
        // @ts-ignore
        viteMiddleware(c.env?.incoming || c.req.raw, c.env?.outgoing || c.res, () => {
          resolve(next());
        });
      });
    });
  } else {
    // Serve static files in production
    app.use('/assets/*', serveStatic({ root: './dist' }));
    app.get('*', serveStatic({ path: './dist/index.html' }));
  }

  console.log(`Server running on http://localhost:${PORT}`);
  
  serve({
    fetch: app.fetch,
    port: PORT
  });
}

startServer();
