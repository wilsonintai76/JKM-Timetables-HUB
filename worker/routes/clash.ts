import { Hono } from 'hono';
import { Bindings } from '../index';
import { optionalAuth, JWTPayload } from '../middleware/auth';

export const clashRoutes = new Hono<{ Bindings: Bindings; Variables: { user?: JWTPayload } }>();

// --- Helper: time overlap check ---
function timeToDecimal(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}

function overlaps(s1: string, e1: string, s2: string, e2: string): boolean {
  return timeToDecimal(s1) < timeToDecimal(e2) && timeToDecimal(e1) > timeToDecimal(s2);
}

// --- Analyze clashes for repeat courses ---
clashRoutes.post('/analyze', optionalAuth, async (c) => {
  try {
    const { repeatCourseCodes, baseSection } = await c.req.json<{
      repeatCourseCodes: string[];
      baseSection: string;
    }>();

    if (!repeatCourseCodes || !baseSection) {
      return c.json({ error: 'repeatCourseCodes and baseSection required' }, 400);
    }

    // Get base class slots
    const { results: baseSlots } = await c.env.DB.prepare(
      'SELECT * FROM master_slots WHERE section = ?'
    ).bind(baseSection).all();

    if (!baseSlots.length) {
      return c.json({ error: `No slots found for section ${baseSection}` }, 404);
    }

    const analysis = [];

    for (const courseCode of repeatCourseCodes) {
      const { results: courseSlots } = await c.env.DB.prepare(
        'SELECT * FROM master_slots WHERE course_code = ?'
      ).bind(courseCode).all();

      if (!courseSlots.length) continue;

      const first = courseSlots[0] as any;
      const sectionMap = new Map<string, typeof courseSlots>();

      for (const s of courseSlots) {
        const sec = (s as any).section;
        if (!sectionMap.has(sec)) sectionMap.set(sec, []);
        sectionMap.get(sec)!.push(s);
      }

      const sections = Array.from(sectionMap.entries()).map(([sec, slots]) => {
        const clashes: any[] = [];
        for (const r of slots) {
          for (const b of baseSlots) {
            if ((r as any).day === (b as any).day && overlaps(
              (r as any).start_time, (r as any).end_time,
              (b as any).start_time, (b as any).end_time
            )) {
              clashes.push({ repeatSlot: r, clashedWith: b });
            }
          }
        }
        return {
          section: sec,
          slots: slots.map(s => ({
            id: (s as any).id,
            section: (s as any).section,
            courseCode: (s as any).course_code,
            courseName: (s as any).course_name,
            creditHours: (s as any).credit_hours,
            day: (s as any).day,
            startTime: (s as any).start_time,
            endTime: (s as any).end_time,
            venue: (s as any).venue,
            lecturer: (s as any).lecturer,
          })),
          isClashFree: clashes.length === 0,
          clashes,
        };
      });

      analysis.push({
        courseCode,
        courseName: first.course_name,
        creditHours: first.credit_hours,
        sections,
      });
    }

    return c.json({ analysis });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- AI-powered clash assistant (Workers AI) ---
clashRoutes.post('/assistant', async (c) => {
  try {
    const {
      studentProfile,
      baseSection,
      selectedRepeatCourses,
      selectedAddons,
      clashAnalysis,
      creditGoal,
      userQuery
    } = await c.req.json();

    // Try Workers AI first
    const ai = c.env?.AI;

    if (!ai) {
      // Fallback to rule-based
      return c.json({
        source: 'rule-based',
        advice: generateRuleBasedAdvice(studentProfile, baseSection, selectedRepeatCourses, selectedAddons, clashAnalysis, creditGoal),
      });
    }

    const systemPrompt = `You are the Senior Academic Advisor & Timetable Clash Resolution Specialist for Politeknik Jabatan Kejuruteraan Mekanikal (JKM).
Your job is to analyze timetable conflicts for a student trying to register repeat/carry courses while maintaining their base semester schedule.

JKM REGULATIONS:
- Core Priority Rule: PRIORITY IS ALWAYS GIVEN TO CARRY / REPEAT MODULES (Kursus Mengulang).
- Credit Limits: Min 12h, Max 20h. Overload up to 26h requires HOD approval.

TASK:
- Suggest optimal section switches to resolve clashes.
- Emphasize that CARRY / REPEAT modules have TOP PRIORITY.
- Provide a professional advisor response in Malay/English.`;

    const userPrompt = `
STUDENT CONTEXT:
- Name: ${studentProfile?.name || 'Student'}
- Base Section: ${baseSection || 'DKM3A'}
- Goal: ${creditGoal || 20} Hours
- Selected Repeats: ${JSON.stringify(selectedRepeatCourses)}
- Current Sections: ${JSON.stringify(selectedAddons)}
- Request: ${userQuery || 'Analyze my schedule.'}

CLASH DATA:
${JSON.stringify(clashAnalysis, null, 2)}`;

    const response: any = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    return c.json({
      source: 'workers-ai',
      advice: response.response || 'AI failed to generate advice.',
    });

  } catch (err: any) {
    console.error('AI Assistant error:', err);
    return c.json({
      source: 'error',
      error: err.message,
      advice: 'Sorry, the AI assistant is currently unavailable. Please try again later or use the manual clash resolver.',
    }, 500);
  }
});

// Rule-based fallback advisor
function generateRuleBasedAdvice(
  studentProfile: any, baseSection: string,
  selectedRepeatCourses: string[], selectedAddons: any,
  clashAnalysis: any[], creditGoal: number
): string {
  let text = `### 🎓 Penasihat Akademik JKM (Rule-Based Analysis)\n\n`;
  text += `**Pelajar:** ${studentProfile?.name || 'Pelajar'} | **Kelas Asas:** ${baseSection || 'DKM3A'} | **Sasaran Kredit:** ${creditGoal || 20} Jam\n\n`;

  if (!selectedRepeatCourses || selectedRepeatCourses.length === 0) {
    text += `Sila pilih sekurang-kurangnya satu kursus ulangan di atas untuk memulakan analisis pertembungan jadual.`;
    return text;
  }

  let totalClashing = 0;
  clashAnalysis?.forEach((c: any) => {
    const currentSec = selectedAddons?.[c.courseCode];
    const isClash = c.sections?.find((s: any) => s.section === currentSec && !s.isClashFree);
    if (isClash) totalClashing++;
  });

  if (totalClashing === 0) {
    text += `✅ **Tahniah!** Semua kursus ulangan yang dipilih berada pada kumpulan masa yang bebas pertembungan (clash-free).\n\n`;
    text += `- Jadual anda kini optimum untuk diproses dalam Slip Kebenaran PA.`;
  } else {
    text += `⚠️ **Pertembungan Masa Dikesan (${totalClashing} kursus terjejas):**\n\n`;
    clashAnalysis?.forEach((c: any) => {
      const clashFree = c.sections?.filter((s: any) => s.isClashFree) || [];
      if (clashFree.length > 0) {
        text += `- **${c.courseCode} (${c.courseName}):** Tukar ke **Kumpulan ${clashFree.map((s: any) => s.section).join(' atau ')}** untuk menyelesaikan pertembungan.\n`;
      } else {
        text += `- **${c.courseCode} (${c.courseName}):** Semua kumpulan dalam Jabatan mempunyai pertembungan dengan kelas asas anda. Disyorkan berjumpa Penasihat Akademik untuk permohonan rentas Jabatan.\n`;
      }
    });
  }
  return text;
}
