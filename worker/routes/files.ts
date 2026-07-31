import { Hono } from 'hono';
import { Bindings } from '../index';
import { authMiddleware, JWTPayload } from '../middleware/auth';

export const fileRoutes = new Hono<{ Bindings: Bindings; Variables: { user: JWTPayload } }>();

// --- Upload file to R2 ---
fileRoutes.put('/upload/:filename', authMiddleware, async (c) => {
  try {
    const { userId } = c.get('user');
    const filename = c.req.param('filename');
    const body = await c.req.arrayBuffer();

    const key = `uploads/${userId}/${Date.now()}-${filename}`;
    await c.env.FILES.put(key, body, {
      httpMetadata: {
        contentType: c.req.header('Content-Type') || 'application/octet-stream',
      },
    });

    return c.json({ success: true, key });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Download file from R2 ---
fileRoutes.get('/download/:key{.*}', authMiddleware, async (c) => {
  try {
    const key = c.req.param('key');
    const object = await c.env.FILES.get(key);

    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    return new Response(object.body, { headers });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- List user files ---
fileRoutes.get('/list', authMiddleware, async (c) => {
  try {
    const { userId } = c.get('user');
    const prefix = `uploads/${userId}/`;

    const objects = await c.env.FILES.list({ prefix });
    return c.json({
      files: objects.objects.map(o => ({
        key: o.key,
        size: o.size,
        uploaded: o.uploaded,
      }))
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Delete file ---
fileRoutes.delete('/:key{.*}', authMiddleware, async (c) => {
  try {
    const key = c.req.param('key');
    await c.env.FILES.delete(key);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
