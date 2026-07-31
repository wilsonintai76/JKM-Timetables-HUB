import { Hono } from 'hono';
import { Bindings } from '../index';
import { authMiddleware, optionalAuth, JWTPayload } from '../middleware/auth';

export const scheduleRoutes = new Hono<{ Bindings: Bindings; Variables: { user?: JWTPayload } }>();

// --- Get all master slots (cached in KV) ---
scheduleRoutes.get('/', optionalAuth, async (c) => {
  try {
    // Try KV cache first
    const cached = await c.env.KV.get('master_slots', 'json');
    if (cached) {
      return c.json({ slots: cached, source: 'kv-cache' });
    }

    // Fallback to D1
    const { results } = await c.env.DB.prepare('SELECT * FROM master_slots ORDER BY section, day, start_time').all();
    return c.json({ slots: results, source: 'd1' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Get slots by section ---
scheduleRoutes.get('/section/:section', optionalAuth, async (c) => {
  const section = c.req.param('section');
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM master_slots WHERE section = ? ORDER BY day, start_time'
    ).bind(section).all();
    return c.json({ slots: results });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Get distinct sections ---
scheduleRoutes.get('/sections', optionalAuth, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT DISTINCT section FROM master_slots ORDER BY section'
    ).all();
    return c.json({ sections: results.map((r: any) => r.section) });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Get distinct courses ---
scheduleRoutes.get('/courses', optionalAuth, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT DISTINCT course_code as code, course_name as name, credit_hours as creditHours FROM master_slots ORDER BY course_code'
    ).all();
    return c.json({ courses: results });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Bulk import slots (admin only) ---
scheduleRoutes.post('/import', authMiddleware, async (c) => {
  const { userId, role } = c.get('user');
  if (role !== 'ADMIN') {
    return c.json({ error: 'Admin only' }, 403);
  }

  try {
    const { slots } = await c.req.json<{ slots: Array<{
      section: string; courseCode: string; courseName: string;
      creditHours?: number; day: string; startTime: string;
      endTime: string; venue: string; lecturer?: string;
    }> }>();

    if (!slots || !Array.isArray(slots)) {
      return c.json({ error: 'slots array required' }, 400);
    }

    const stmt = c.env.DB.prepare(
      `INSERT OR REPLACE INTO master_slots (id, section, course_code, course_name, credit_hours, day, start_time, end_time, venue, lecturer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const batch = slots.map(s => stmt.bind(
      crypto.randomUUID(),
      s.section,
      s.courseCode,
      s.courseName,
      s.creditHours || 3,
      s.day,
      s.startTime,
      s.endTime,
      s.venue,
      s.lecturer || null
    ));

    await c.env.DB.batch(batch);

    // Invalidate KV cache
    await c.env.KV.delete('master_slots');

    return c.json({ success: true, count: slots.length });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Clear all slots (admin only) ---
scheduleRoutes.delete('/clear', authMiddleware, async (c) => {
  const { role } = c.get('user');
  if (role !== 'ADMIN') {
    return c.json({ error: 'Admin only' }, 403);
  }

  try {
    await c.env.DB.prepare('DELETE FROM master_slots').run();
    await c.env.KV.delete('master_slots');
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Warm KV cache (admin only) ---
scheduleRoutes.post('/cache-warm', authMiddleware, async (c) => {
  const { role } = c.get('user');
  if (role !== 'ADMIN') {
    return c.json({ error: 'Admin only' }, 403);
  }

  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM master_slots ORDER BY section, day, start_time').all();
    await c.env.KV.put('master_slots', JSON.stringify(results), { expirationTtl: 3600 }); // 1 hour
    return c.json({ success: true, count: results.length });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
