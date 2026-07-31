import { Hono } from 'hono';
import { Bindings } from '../index';
import { authMiddleware, optionalAuth, JWTPayload } from '../middleware/auth';

const DAY_MAP: Record<string, number> = { ISNIN: 0, SELASA: 1, RABU: 2, KHAMIS: 3, JUMAAT: 4, SABTU: 5 };

export const scheduleRoutes = new Hono<{ Bindings: Bindings; Variables: { user?: JWTPayload } }>();

// --- Get all master slots (JOIN courses for name/credits, cached in KV) ---
scheduleRoutes.get('/', optionalAuth, async (c) => {
  try {
    const cached = await c.env.KV.get('master_slots_v2', 'json');
    if (cached) return c.json({ slots: cached, source: 'kv-cache' });

    const { results } = await c.env.DB.prepare(`
      SELECT ms.id, ms.section, ms.course_code, c.name as course_name, c.credit_hours,
             ms.day, ms.start_time, ms.end_time, ms.venue, ms.lecturer
      FROM master_slots ms
      JOIN courses c ON ms.course_code = c.code
      ORDER BY ms.section, ms.day, ms.start_time
    `).all();
    return c.json({ slots: results, source: 'd1' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Get slots by section ---
scheduleRoutes.get('/section/:section', optionalAuth, async (c) => {
  const section = c.req.param('section');
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT ms.id, ms.section, ms.course_code, c.name as course_name, c.credit_hours,
             ms.day, ms.start_time, ms.end_time, ms.venue, ms.lecturer
      FROM master_slots ms
      JOIN courses c ON ms.course_code = c.code
      WHERE ms.section = ?
      ORDER BY ms.day, ms.start_time
    `).bind(section).all();
    return c.json({ slots: results });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Get distinct sections ---
scheduleRoutes.get('/sections', optionalAuth, async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT code, department, semester FROM sections ORDER BY code').all();
    return c.json({ sections: results });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Get distinct courses (v2: from normalized courses table) ---
scheduleRoutes.get('/courses', optionalAuth, async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT code, name, credit_hours as creditHours FROM courses ORDER BY code').all();
    return c.json({ courses: results });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Bulk import slots (admin only) ---
scheduleRoutes.post('/import', authMiddleware, async (c) => {
  const { role } = c.get('user');
  if (role !== 'ADMIN') return c.json({ error: 'Admin only' }, 403);

  try {
    const { slots } = await c.req.json<{ slots: Array<{
      section: string; courseCode: string; courseName: string;
      creditHours?: number; day: string|number; startTime: string;
      endTime: string; venue: string; lecturer?: string;
    }> }>();

    if (!slots?.length) return c.json({ error: 'slots array required' }, 400);

    const now = Math.floor(Date.now() / 1000);
    const slotStmt = c.env.DB.prepare(
      `INSERT OR REPLACE INTO master_slots (id, section, course_code, day, start_time, end_time, venue, lecturer, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const courseStmt = c.env.DB.prepare(
      'INSERT OR IGNORE INTO courses (code, name, credit_hours) VALUES (?, ?, ?)'
    );
    const sectionStmt = c.env.DB.prepare(
      'INSERT OR IGNORE INTO sections (code, department, semester) VALUES (?, ?, ?)'
    );

    const batch: D1PreparedStatement[] = [];
    for (const s of slots) {
      const dayNum = typeof s.day === 'number' ? s.day : (DAY_MAP[s.day.toUpperCase()] ?? 0);
      batch.push(courseStmt.bind(s.courseCode, s.courseName, s.creditHours || 3));
      batch.push(sectionStmt.bind(s.section, 'JKM', 1));
      batch.push(slotStmt.bind(crypto.randomUUID(), s.section, s.courseCode, dayNum, s.startTime, s.endTime, s.venue, s.lecturer || null, now));
    }

    await c.env.DB.batch(batch);
    await c.env.KV.delete('master_slots_v2');

    return c.json({ success: true, count: slots.length });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Clear all slots (admin only) ---
scheduleRoutes.delete('/clear', authMiddleware, async (c) => {
  if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Admin only' }, 403);
  try {
    await c.env.DB.prepare('DELETE FROM master_slots').run();
    await c.env.KV.delete('master_slots_v2');
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Warm KV cache (admin only) ---
scheduleRoutes.post('/cache-warm', authMiddleware, async (c) => {
  if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Admin only' }, 403);
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT ms.id, ms.section, ms.course_code, c.name as course_name, c.credit_hours,
             ms.day, ms.start_time, ms.end_time, ms.venue, ms.lecturer
      FROM master_slots ms JOIN courses c ON ms.course_code = c.code
      ORDER BY ms.section, ms.day, ms.start_time
    `).all();
    await c.env.KV.put('master_slots_v2', JSON.stringify(results), { expirationTtl: 3600 });
    return c.json({ success: true, count: results.length });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
