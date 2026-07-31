import { Hono } from 'hono';
import { Bindings } from '../index';
import { authMiddleware, JWTPayload } from '../middleware/auth';

export const feedbackRoutes = new Hono<{ Bindings: Bindings; Variables: { user?: JWTPayload } }>();

// --- Submit feedback (JOIN user name) ---
feedbackRoutes.post('/', authMiddleware, async (c) => {
  try {
    const { userId } = c.get('user');
    const { category, courseCode, rating, message } = await c.req.json();

    if (!message || !category) return c.json({ error: 'Message and category required' }, 400);

    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO feedback (id, user_id, category, course_code, rating, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'New')`
    ).bind(id, userId, category, courseCode || null, rating || 3, message).run();

    return c.json({ success: true, id }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Get all feedback with user names (admin only) ---
feedbackRoutes.get('/', authMiddleware, async (c) => {
  if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Admin only' }, 403);

  try {
    const { results } = await c.env.DB.prepare(`
      SELECT f.*, u.name, u.email
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
    `).all();

    return c.json({
      feedback: results.map((f: any) => ({
        id: f.id, userId: f.user_id, name: f.name, email: f.email,
        category: f.category, courseCode: f.course_code,
        rating: f.rating, message: f.message, status: f.status,
        createdAt: f.created_at,
      }))
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Update feedback status (admin only) ---
feedbackRoutes.patch('/:id/status', authMiddleware, async (c) => {
  if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Admin only' }, 403);

  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    if (!['New', 'Under Review', 'Resolved'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    await c.env.DB.prepare('UPDATE feedback SET status = ? WHERE id = ?').bind(status, id).run();
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
