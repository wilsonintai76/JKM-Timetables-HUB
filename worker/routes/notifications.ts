import { Hono } from 'hono';
import { Bindings } from '../index';
import { authMiddleware, optionalAuth, JWTPayload } from '../middleware/auth';

export const notificationRoutes = new Hono<{ Bindings: Bindings; Variables: { user?: JWTPayload } }>();

// --- Get all active notifications ---
notificationRoutes.get('/', optionalAuth, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM notifications WHERE active = 1 ORDER BY created_at DESC'
    ).all();

    return c.json({
      notifications: results.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        date: n.date,
        active: !!n.active,
      }))
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Create notification (admin only) ---
notificationRoutes.post('/', authMiddleware, async (c) => {
  const { role } = c.get('user');
  if (role !== 'ADMIN') {
    return c.json({ error: 'Admin only' }, 403);
  }

  try {
    const { title, message, type, date } = await c.req.json();
    if (!title || !message) {
      return c.json({ error: 'Title and message required' }, 400);
    }

    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO notifications (id, title, message, type, date, active) VALUES (?, ?, ?, ?, ?, 1)`
    ).bind(id, title, message, type || 'info', date || new Date().toISOString().split('T')[0]).run();

    return c.json({ success: true, id }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Toggle notification active status (admin only) ---
notificationRoutes.patch('/:id/toggle', authMiddleware, async (c) => {
  const { role } = c.get('user');
  if (role !== 'ADMIN') {
    return c.json({ error: 'Admin only' }, 403);
  }

  try {
    const id = c.req.param('id');
    const { active } = await c.req.json();

    await c.env.DB.prepare('UPDATE notifications SET active = ? WHERE id = ?')
      .bind(active ? 1 : 0, id).run();

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Delete notification (admin only) ---
notificationRoutes.delete('/:id', authMiddleware, async (c) => {
  const { role } = c.get('user');
  if (role !== 'ADMIN') {
    return c.json({ error: 'Admin only' }, 403);
  }

  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM notifications WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
