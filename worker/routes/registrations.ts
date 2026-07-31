import { Hono } from 'hono';
import { Bindings } from '../index';
import { authMiddleware, JWTPayload } from '../middleware/auth';

export const registrationRoutes = new Hono<{ Bindings: Bindings; Variables: { user: JWTPayload } }>();

// --- Submit registration (student) ---
registrationRoutes.post('/', authMiddleware, async (c) => {
  try {
    const { userId } = c.get('user');
    const { baseSection, repeatCourses, selectedAddons, totalCredits } = await c.req.json<{
      baseSection: string;
      repeatCourses: string[];
      selectedAddons: Record<string, string>;
      totalCredits: number;
    }>();

    if (!repeatCourses?.length || !baseSection) {
      return c.json({ error: 'repeatCourses and baseSection required' }, 400);
    }

    const regId = crypto.randomUUID();

    // Insert registration header
    await c.env.DB.prepare(
      `INSERT INTO registrations (id, student_id, base_section, total_credits, status)
       VALUES (?, ?, ?, ?, 'PENDING')`
    ).bind(regId, userId, baseSection, totalCredits || 0).run();

    // Insert registration items (junction table)
    const itemStmt = c.env.DB.prepare(
      `INSERT INTO registration_items (id, registration_id, course_code, selected_section)
       VALUES (?, ?, ?, ?)`
    );
    const batch = repeatCourses.map(courseCode =>
      itemStmt.bind(crypto.randomUUID(), regId, courseCode, selectedAddons[courseCode] || baseSection)
    );
    if (batch.length) await c.env.DB.batch(batch);

    return c.json({ success: true, id: regId }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Get my registrations (student) or all (admin/advisor) ---
registrationRoutes.get('/mine', authMiddleware, async (c) => {
  const { userId, role } = c.get('user');

  try {
    const whereClause = (role === 'ADMIN' || role === 'ADVISOR') ? '' : 'WHERE r.student_id = ?';
    const params: any[] = (role === 'ADMIN' || role === 'ADVISOR') ? [] : [userId];

    // Get registrations with student name JOIN
    const { results } = await c.env.DB.prepare(`
      SELECT r.*, u.name as student_name,
             COALESCE(adv.name, '') as advisor_name
      FROM registrations r
      JOIN users u ON r.student_id = u.id
      LEFT JOIN users adv ON r.advisor_id = adv.id
      ${whereClause}
      ORDER BY r.created_at DESC
    `).bind(...params).all();

    // For each registration, get its items
    const registrations = [];
    for (const r of results) {
      const { results: items } = await c.env.DB.prepare(`
        SELECT ri.course_code, ri.selected_section, c.name as course_name, c.credit_hours
        FROM registration_items ri
        JOIN courses c ON ri.course_code = c.code
        WHERE ri.registration_id = ?
      `).bind((r as any).id).all();

      registrations.push({
        id: (r as any).id,
        studentId: (r as any).student_id,
        studentName: (r as any).student_name,
        baseSection: (r as any).base_section,
        repeatCourses: items.map((i: any) => i.course_code),
        selectedAddons: Object.fromEntries(items.map((i: any) => [i.course_code, i.selected_section])),
        totalCredits: (r as any).total_credits,
        status: (r as any).status,
        timestamp: new Date((r as any).created_at * 1000).toISOString(),
        advisorNotes: (r as any).advisor_notes,
        advisorName: (r as any).advisor_name,
        createdAt: (r as any).created_at,
      });
    }

    return c.json({ registrations });
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

    await c.env.DB.prepare(
      'UPDATE registrations SET status = ?, advisor_notes = ?, advisor_id = ? WHERE id = ?'
    ).bind(status, advisorNotes || null, userId, id).run();

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Delete registration (own or admin) ---
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
    // CASCADE deletes registration_items
    await c.env.DB.prepare('DELETE FROM registrations WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
