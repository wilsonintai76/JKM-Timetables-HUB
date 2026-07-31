import { Hono } from 'hono';
import { Bindings } from '../index';
import { authMiddleware, JWTPayload } from '../middleware/auth';

export const registrationRoutes = new Hono<{ Bindings: Bindings; Variables: { user: JWTPayload } }>();

// --- Submit registration (student) ---
registrationRoutes.post('/', authMiddleware, async (c) => {
  try {
    const { userId } = c.get('user');
    const { studentName, matrixNo, baseSection, repeatCourses, selectedAddons, totalCredits } = await c.req.json();

    if (!repeatCourses || !baseSection) {
      return c.json({ error: 'repeatCourses and baseSection required' }, 400);
    }

    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    await c.env.DB.prepare(
      `INSERT INTO registrations (id, student_id, student_name, matrix_no, base_section, repeat_courses, selected_addons, total_credits, status, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`
    ).bind(
      id, userId, studentName, matrixNo, baseSection,
      JSON.stringify(repeatCourses), JSON.stringify(selectedAddons),
      totalCredits || 0, timestamp
    ).run();

    return c.json({ success: true, id }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Get my registrations (student) ---
registrationRoutes.get('/mine', authMiddleware, async (c) => {
  const { userId, role } = c.get('user');

  try {
    let query: string;
    let params: any[];

    if (role === 'ADMIN' || role === 'ADVISOR') {
      query = 'SELECT * FROM registrations ORDER BY created_at DESC';
      params = [];
    } else {
      query = 'SELECT * FROM registrations WHERE student_id = ? ORDER BY created_at DESC';
      params = [userId];
    }

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
      registrations: results.map((r: any) => ({
        id: r.id,
        studentId: r.student_id,
        studentName: r.student_name,
        matrixNo: r.matrix_no,
        baseSection: r.base_section,
        repeatCourses: JSON.parse(r.repeat_courses),
        selectedAddons: JSON.parse(r.selected_addons),
        totalCredits: r.total_credits,
        status: r.status,
        timestamp: r.timestamp,
        advisorNotes: r.advisor_notes,
        advisorName: r.advisor_name,
      }))
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Update registration status (advisor/admin) ---
registrationRoutes.patch('/:id', authMiddleware, async (c) => {
  const { userId, role } = c.get('user');
  if (role !== 'ADMIN' && role !== 'ADVISOR') {
    return c.json({ error: 'Advisor or Admin only' }, 403);
  }

  try {
    const id = c.req.param('id');
    const { status, advisorNotes } = await c.req.json();

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    // Get advisor name
    const user = await c.env.DB.prepare('SELECT name FROM users WHERE id = ?').bind(userId).first();
    const advisorName = (user as any)?.name || 'Advisor';

    await c.env.DB.prepare(
      'UPDATE registrations SET status = ?, advisor_notes = ?, advisor_name = ? WHERE id = ?'
    ).bind(status, advisorNotes || null, advisorName, id).run();

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Delete registration (student, own only) ---
registrationRoutes.delete('/:id', authMiddleware, async (c) => {
  const { userId, role } = c.get('user');
  const id = c.req.param('id');

  try {
    if (role !== 'ADMIN') {
      const reg = await c.env.DB.prepare('SELECT student_id FROM registrations WHERE id = ?').bind(id).first();
      if (!reg || (reg as any).student_id !== userId) {
        return c.json({ error: 'Not found or not authorized' }, 404);
      }
    }

    await c.env.DB.prepare('DELETE FROM registrations WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
