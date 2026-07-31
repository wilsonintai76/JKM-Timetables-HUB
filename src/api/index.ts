import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Define Cloudflare-like bindings for your target deployment
type Bindings = {
  DB: any; // Cloudflare D1
  KV: any; // Cloudflare KV
  AI: any; // Cloudflare Worker AI
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

app.use('*', cors());

// --- DATABASE & CACHE PERSISTENCE (PLANNED) ---
// Example usage for your Cloudflare stack:
/*
app.get('/sync-history', async (c) => {
  const { DB, KV } = c.env;
  // KV: Cache the latest timetable metadata
  const cached = await KV.get('latest_slots_hash');
  
  // D1: Fetch user history
  const { results } = await DB.prepare('SELECT * FROM activity_logs WHERE user_id = ?').bind('user_123').all();
  return c.json({ results });
});
*/

// Helper functions for JKM logic
function generateRuleBasedAdvice(studentProfile: any, baseSection: string, selectedRepeatCourses: string[], selectedAddons: any, clashAnalysis: any[], creditGoal: number) {
  let text = `### 🎓 Penasihat Akademik JKM (Rule-Based Analysis)\n\n`;
  text += `**Pelajar:** ${studentProfile?.name || 'Pelajar'} | **Kelas Asas:** ${baseSection || 'DKM3A'} | **Sasaran Kredit:** ${creditGoal || 20} Jam\n\n`;

  if (!selectedRepeatCourses || selectedRepeatCourses.length === 0) {
    text += `Sila pilih sekurang-kurangnya satu kursus ulangan di atas untuk memulakan analisis pertembungan jadual.`;
    return text;
  }

  let totalClashing = 0;
  clashAnalysis?.forEach(c => {
    const currentSec = selectedAddons[c.courseCode];
    const isClash = c.sections.find((s: any) => s.section === currentSec && !s.isClashFree);
    if (isClash) totalClashing++;
  });

  if (totalClashing === 0) {
    text += `✅ **Tahniah!** Semua kursus ulangan yang dipilih berada pada kumpulan masa yang bebas pertembungan (clash-free).\n\n`;
    text += `- Jadual anda kini optimum untuk diproses dalam Slip Kebenaran PA.`;
  } else {
    text += `⚠️ **Pertembungan Masa Dikesan (${totalClashing} kursus terjejas):**\n\n`;
    clashAnalysis?.forEach(c => {
      const clashFree = c.sections.filter((s: any) => s.isClashFree);
      if (clashFree.length > 0) {
        text += `- **${c.courseCode} (${c.courseName}):** Tukar ke **Kumpulan ${clashFree.map((s: any) => s.section).join(' atau ')}** untuk menyelesaikan pertembungan.\n`;
      } else {
        text += `- **${c.courseCode} (${c.courseName}):** Semua kumpulan dalam Jabatan mempunyai pertembungan dengan kelas asas anda. Disyorkan berjumpa Penasihat Akademik untuk permohonan rentas Jabatan.\n`;
      }
    });
  }

  return text;
}

function generateRecommendedActions(clashAnalysis: any[], masterSlots: any[], selectedRepeatCourses: string[], selectedAddons: any) {
  const actions: { courseCode: string; currentSection: string; recommendedSection: string; reason: string }[] = [];

  if (!clashAnalysis) return actions;

  clashAnalysis.forEach(c => {
    const currentSec = selectedAddons[c.courseCode];
    const currentSectionData = c.sections.find((s: any) => s.section === currentSec);

    if (!currentSectionData || !currentSectionData.isClashFree) {
      const firstFree = c.sections.find((s: any) => s.isClashFree);
      if (firstFree) {
        actions.push({
          courseCode: c.courseCode,
          currentSection: currentSec || 'None',
          recommendedSection: firstFree.section,
          reason: `Section ${firstFree.section} is 100% clash-free with ${c.sections.length} candidate slots.`
        });
      }
    }
  });

  return actions;
}

const routes = app
  .post('/clash-assistant', async (c) => {
    try {
      const {
        studentProfile,
        baseSection,
        selectedRepeatCourses,
        selectedAddons,
        clashAnalysis,
        masterSlots,
        creditGoal,
        userQuery
      } = await c.req.json();

      // Check for Worker AI binding
      const ai = c.env?.AI;

      if (!ai) {
        // Fallback to Rule-Based logic if not running in a Cloudflare Worker environment with AI enabled
        return c.json({
          success: true,
          source: 'algorithmic_fallback',
          advice: generateRuleBasedAdvice(studentProfile, baseSection, selectedRepeatCourses, selectedAddons, clashAnalysis, creditGoal),
          recommendations: generateRecommendedActions(clashAnalysis, masterSlots, selectedRepeatCourses, selectedAddons)
        });
      }

      const clashSummary = clashAnalysis.map((c: any) => ({
        courseCode: c.courseCode,
        courseName: c.courseName,
        creditHours: c.creditHours,
        totalClashingSections: c.totalClashingSections,
        totalClashFreeSections: c.totalClashFreeSections,
        clashFreeSectionsList: c.sections.filter((s: any) => s.isClashFree).map((s: any) => s.section),
        clashingSectionsList: c.sections.filter((s: any) => !s.isClashFree).map((s: any) => s.section)
      }));

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
${JSON.stringify(clashSummary, null, 2)}
`;

      // Run Cloudflare Worker AI (Llama 3 8B)
      const response: any = await ai.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      });

      return c.json({
        success: true,
        source: 'worker_ai_llama3',
        advice: response.response || 'AI failed to generate advice.',
        recommendations: generateRecommendedActions(clashAnalysis, masterSlots, selectedRepeatCourses, selectedAddons)
      });

    } catch (err: any) {
      console.error('Worker AI Assistant error:', err);
      return c.json({
        success: false,
        error: err.message || 'Failed to analyze schedule with Worker AI.'
      }, 500);
    }
  });

export type AppType = typeof routes;
export default app;
