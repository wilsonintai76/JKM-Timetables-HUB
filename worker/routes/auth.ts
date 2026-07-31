import { Hono } from 'hono';
import { Bindings } from '../index';
import { signToken, authMiddleware, JWTPayload } from '../middleware/auth';

export const authRoutes = new Hono<{ Bindings: Bindings; Variables: { user: JWTPayload } }>();

// --- Register ---
authRoutes.post('/register', async (c) => {
  try {
    const { email, password, name, matrixNo, program, session, semester, baseSection } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Check if user already exists
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) {
      return c.json({ error: 'User already exists' }, 409);
    }

    // Hash password using Web Crypto
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password + c.env.JWT_SECRET));
    const passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const userId = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, name, matrix_no, role, program, session, semester, base_section)
       VALUES (?, ?, ?, ?, ?, 'STUDENT', ?, ?, ?, ?)`
    ).bind(userId, email, passwordHash, name, matrixNo || null, program || 'DIPLOMA IN MECHANICAL ENGINEERING (DKM)', session || null, semester || null, baseSection || null).run();

    const token = await signToken({ userId, email, role: 'STUDENT' }, c.env.JWT_SECRET);

    return c.json({
      token,
      user: { id: userId, email, name, role: 'STUDENT', matrixNo, program, baseSection }
    }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Login ---
authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const user = await c.env.DB.prepare(
      'SELECT id, email, password_hash, name, matrix_no, role, program, base_section, pa_name, department, office_location, assigned_section, consultation_hours FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password + c.env.JWT_SECRET));
    const passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (passwordHash !== (user as any).password_hash) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = await signToken(
      { userId: user.id as string, email: user.email as string, role: user.role as string },
      c.env.JWT_SECRET
    );

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        matrixNo: user.matrix_no,
        role: user.role,
        program: user.program,
        baseSection: user.base_section,
        paName: user.pa_name,
        department: user.department,
        officeLocation: user.office_location,
        assignedSection: user.assigned_section,
        consultationHours: user.consultation_hours ? JSON.parse(user.consultation_hours as string) : undefined,
      }
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Get current user ---
authRoutes.get('/me', authMiddleware, async (c) => {
  const { userId } = c.get('user');

  const user = await c.env.DB.prepare(
    'SELECT id, email, name, matrix_no, role, program, session, semester, base_section, pa_name, phone, department, office_location, assigned_section, consultation_hours FROM users WHERE id = ?'
  ).bind(userId).first();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      matrixNo: user.matrix_no,
      role: user.role,
      program: user.program,
      session: user.session,
      semester: user.semester,
      baseSection: user.base_section,
      paName: user.pa_name,
      phone: user.phone,
      department: user.department,
      officeLocation: user.office_location,
      assignedSection: user.assigned_section,
      consultationHours: user.consultation_hours ? JSON.parse(user.consultation_hours as string) : undefined,
    }
  });
});

// --- Update profile ---
authRoutes.patch('/profile', authMiddleware, async (c) => {
  const { userId } = c.get('user');
  const { name, matrixNo, program, session, semester, baseSection, phone } = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];

  if (name !== undefined) { updates.push('name = ?'); values.push(name); }
  if (matrixNo !== undefined) { updates.push('matrix_no = ?'); values.push(matrixNo); }
  if (program !== undefined) { updates.push('program = ?'); values.push(program); }
  if (session !== undefined) { updates.push('session = ?'); values.push(session); }
  if (semester !== undefined) { updates.push('semester = ?'); values.push(semester); }
  if (baseSection !== undefined) { updates.push('base_section = ?'); values.push(baseSection); }
  if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  updates.push("updated_at = datetime('now')");
  values.push(userId);

  await c.env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

  return c.json({ success: true });
});
