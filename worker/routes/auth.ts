import { Hono } from 'hono';
import { Bindings } from '../index';
import { signToken, authMiddleware, JWTPayload } from '../middleware/auth';

// Day mapping helpers
const DAY_MAP: Record<string, number> = { ISNIN: 0, SELASA: 1, RABU: 2, KHAMIS: 3, JUMAAT: 4, SABTU: 5 };

export const authRoutes = new Hono<{ Bindings: Bindings; Variables: { user: JWTPayload } }>();

// --- Register ---
authRoutes.post('/register', async (c) => {
  try {
    const {
      email, password, name, role,
      // Student fields
      matrixNo, program, session, semester, baseSection,
      // Advisor fields
      department, officeLocation, assignedSection, consultationHours
    } = await c.req.json<{
      email: string; password: string; name: string; role?: string;
      matrixNo?: string; program?: string; session?: string;
      semester?: number; baseSection?: string;
      department?: string; officeLocation?: string;
      assignedSection?: string; consultationHours?: string;
    }>();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const userRole = role || 'STUDENT';
    if (!['STUDENT', 'ADVISOR', 'ADMIN'].includes(userRole)) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    // Admin/Advisor registration: only allow if caller is already an admin (or via seed)
    // For now, public registration creates STUDENT only
    const effectiveRole = 'STUDENT'; // Public API only creates students

    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) {
      return c.json({ error: 'User already exists' }, 409);
    }

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password + c.env.JWT_SECRET));
    const passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const userId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    // Insert base user
    const baseStmt = c.env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    if (effectiveRole === 'STUDENT') {
      // Insert user + student profile in a batch
      const studentStmt = c.env.DB.prepare(
        `INSERT INTO students (user_id, matrix_no, program, session, semester, base_section)
         VALUES (?, ?, ?, ?, ?, ?)`
      );
      await c.env.DB.batch([
        baseStmt.bind(userId, email, passwordHash, name, effectiveRole, now, now),
        studentStmt.bind(userId, matrixNo || null, program || 'DIPLOMA IN MECHANICAL ENGINEERING (DKM)', session || null, semester || 1, baseSection || null),
      ]);
    } else {
      await baseStmt.bind(userId, email, passwordHash, name, effectiveRole, now, now).run();
    }

    const token = await signToken({ userId, email, role: effectiveRole }, c.env.JWT_SECRET);

    return c.json({
      token,
      user: effectiveRole === 'STUDENT'
        ? { id: userId, email, name, role: effectiveRole, matrixNo, program, baseSection }
        : { id: userId, email, name, role: effectiveRole }
    }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Login ---
authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: 'Email and password required' }, 400);

    // JOIN users + role-specific profile
    const row = await c.env.DB.prepare(`
      SELECT u.id, u.email, u.password_hash, u.name, u.role, u.phone,
             s.matrix_no, s.program, s.session, s.semester, s.base_section, s.pa_name,
             a.department, a.office_location, a.assigned_section, a.consultation_hours
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN advisors a ON u.id = a.user_id
      WHERE u.email = ?
    `).bind(email).first();

    if (!row) return c.json({ error: 'Invalid credentials' }, 401);

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password + c.env.JWT_SECRET));
    const passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (passwordHash !== (row as any).password_hash) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = await signToken(
      { userId: row.id as string, email: row.email as string, role: row.role as string },
      c.env.JWT_SECRET
    );

    return c.json({
      token,
      user: {
        id: row.id, email: row.email, name: row.name, role: row.role, phone: row.phone,
        matrixNo: (row as any).matrix_no, program: (row as any).program,
        session: (row as any).session, semester: (row as any).semester,
        baseSection: (row as any).base_section, paName: (row as any).pa_name,
        department: (row as any).department, officeLocation: (row as any).office_location,
        assignedSection: (row as any).assigned_section,
        consultationHours: (row as any).consultation_hours ? JSON.parse((row as any).consultation_hours as string) : undefined,
      }
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Get current user ---
authRoutes.get('/me', authMiddleware, async (c) => {
  const { userId } = c.get('user');

  const row = await c.env.DB.prepare(`
    SELECT u.id, u.email, u.name, u.role, u.phone,
           s.matrix_no, s.program, s.session, s.semester, s.base_section, s.pa_name,
           a.department, a.office_location, a.assigned_section, a.consultation_hours
    FROM users u
    LEFT JOIN students s ON u.id = s.user_id
    LEFT JOIN advisors a ON u.id = a.user_id
    WHERE u.id = ?
  `).bind(userId).first();

  if (!row) return c.json({ error: 'User not found' }, 404);

  return c.json({
    user: {
      id: row.id, email: row.email, name: row.name, role: row.role, phone: row.phone,
      matrixNo: (row as any).matrix_no, program: (row as any).program,
      session: (row as any).session, semester: (row as any).semester,
      baseSection: (row as any).base_section, paName: (row as any).pa_name,
      department: (row as any).department, officeLocation: (row as any).office_location,
      assignedSection: (row as any).assigned_section,
      consultationHours: (row as any).consultation_hours ? JSON.parse((row as any).consultation_hours as string) : undefined,
    }
  });
});

// --- Update profile ---
authRoutes.patch('/profile', authMiddleware, async (c) => {
  const { userId } = c.get('user');
  const { name, matrixNo, program, session, semester, baseSection, phone } = await c.req.json();

  const now = Math.floor(Date.now() / 1000);

  // Update base user fields
  if (name || phone) {
    const uUpdates: string[] = [];
    const uValues: any[] = [];
    if (name) { uUpdates.push('name = ?'); uValues.push(name); }
    if (phone) { uUpdates.push('phone = ?'); uValues.push(phone); }
    if (uUpdates.length) {
      uUpdates.push('updated_at = ?');
      uValues.push(now, userId);
      await c.env.DB.prepare(`UPDATE users SET ${uUpdates.join(', ')} WHERE id = ?`).bind(...uValues).run();
    }
  }

  // Update student profile fields
  if (matrixNo || program || session || semester || baseSection) {
    const sUpdates: string[] = [];
    const sValues: any[] = [];
    if (matrixNo) { sUpdates.push('matrix_no = ?'); sValues.push(matrixNo); }
    if (program) { sUpdates.push('program = ?'); sValues.push(program); }
    if (session) { sUpdates.push('session = ?'); sValues.push(session); }
    if (semester) { sUpdates.push('semester = ?'); sValues.push(semester); }
    if (baseSection) { sUpdates.push('base_section = ?'); sValues.push(baseSection); }
    if (sUpdates.length) {
      sValues.push(userId);
      await c.env.DB.prepare(`UPDATE students SET ${sUpdates.join(', ')} WHERE user_id = ?`).bind(...sValues).run();
    }
  }

  return c.json({ success: true });
});
