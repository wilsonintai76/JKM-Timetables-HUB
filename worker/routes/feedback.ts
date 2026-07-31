import { Hono } from 'hono';
import { Bindings } from '../index';
import { authMiddleware, optionalAuth, JWTPayload } from '../middleware/auth';

export const feedbackRoutes = new Hono<{ Bindings: Bindings; Variables: { user?: JWTPayload } }>();

// --- Submit feedback ---
feedbackRoutes.post('/', authMiddleware, async (c) => {
  try {
    const { userId, email } = c.get('user');
    const { name, category, courseCode, rating, message } = await c.req.json();

    if (!message || !category) {
      return c.json({ error: 'Message and category required' }, 400);
    }

    const id = crypto.randomUUID();
    const date = new Date().toISOString().split('T')[0];

    await c.env.DB.prepare(
      `INSERT INTO feedback (id, user_id, name, email, category, course_code, rating, message, date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')`
    ).bind(id, userId, name || 'Anonymous', email, category, courseCode || null, rating || 3, message, date).run();

    return c.json({ success: true, id }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Get all feedback (admin only) ---
feedbackRoutes.get('/', authMiddleware, async (c) => {
  const { role } = c.get('user');
  if (role !== 'ADMIN') {
    return c.json({ error: 'Admin only' }, 403);
  }

  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM feedback ORDER BY created_at DESC'
    ).all();

    return c.json({
      feedback: results.map((f: any) => ({
        id: f.id,
        userId: f.user_id,
        name: f.name,
        email: f.email,
        category: f.category,
        courseCode: f.course_code,
        rating: f.rating,
        message: f.message,
        date: f.date,
        status: f.status,
      }))
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Update feedback status (admin only) ---
feedbackRoutes.patch('/:id/status', authMiddleware, async (c) => {
  const { role } = c.get('user');
  if (role !== 'ADMIN') {
    return c.json({ error: 'Admin only' }, 403);
  }

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
