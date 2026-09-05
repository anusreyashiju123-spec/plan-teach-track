/**
 * Acadify domain calculations: progress, pacing, planned schedule, planner tips.
 * Everything here derives from the teacher's real stored data — nothing random.
 */

export type Topic = {
  topic_id: string;
  module_id: string;
  topic_name: string;
  estimated_classes: number;
  position: number;
  completed: boolean;
  completed_date: string | null;
};

export type Module = {
  module_id: string;
  subject_id: string;
  module_number: number;
  module_name: string;
  estimated_classes: number;
};

export type Subject = {
  subject_id: string;
  teacher_id: string;
  subject_name: string;
  subject_code: string;
  department: string;
  semester: string;
  academic_year: string;
  total_classes: number;
  classes_per_week: number;
  start_date: string | null;
  end_date: string | null;
};

export type ClassSession = {
  session_id: string;
  subject_id: string;
  module_id: string | null;
  topic_id: string | null;
  class_date: string;
  classes_used: number;
  notes: string;
};

export type ModuleWithTopics = Module & { topics: Topic[] };

export type ScheduleStatus = "ahead" | "on" | "behind";

export type ModuleStats = {
  module: ModuleWithTopics;
  total: number;
  completed: number;
  remaining: number;
  percent: number;
};

export type SubjectStats = {
  subject: Subject;
  modules: ModuleStats[];
  totalModules: number;
  totalTopics: number;
  completedTopics: number;
  remainingTopics: number;
  totalClassesRequired: number;
  classesCompleted: number;
  classesRemaining: number;
  actualPercent: number;
  expectedPercent: number;
  status: ScheduleStatus;
  availableWeeks: number;
  weeksElapsed: number;
  weeksRemaining: number;
  weeklyTarget: number;
  classesPerWeek: number;
};

const DAY = 86_400_000;

export function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

function toDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function weeksBetween(start: string | null, end: string | null): number {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e) return 0;
  return Math.max(0, Math.ceil((e.getTime() - s.getTime()) / (7 * DAY)));
}

/** Expected completion % from today's position between start and end date. */
export function expectedProgress(
  start: string | null,
  end: string | null,
  now = new Date(),
): number {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e || e.getTime() <= s.getTime()) return 0;
  const ratio = (now.getTime() - s.getTime()) / (e.getTime() - s.getTime());
  return Math.round(Math.min(1, Math.max(0, ratio)) * 100);
}

export function scheduleStatus(actual: number, expected: number): ScheduleStatus {
  const diff = actual - expected;
  if (diff >= 5) return "ahead";
  if (diff <= -5) return "behind";
  return "on";
}

export const statusLabel: Record<ScheduleStatus, string> = {
  ahead: "Ahead of Schedule",
  on: "On Schedule",
  behind: "Behind Schedule",
};

export function moduleStats(module: ModuleWithTopics): ModuleStats {
  const total = module.topics.length;
  const completed = module.topics.filter((t) => t.completed).length;
  return {
    module,
    total,
    completed,
    remaining: total - completed,
    percent: pct(completed, total),
  };
}

export function subjectStats(
  subject: Subject,
  modules: ModuleWithTopics[],
  sessions: ClassSession[] = [],
  now = new Date(),
): SubjectStats {
  const mods = modules.map(moduleStats);
  const totalTopics = mods.reduce((a, m) => a + m.total, 0);
  const completedTopics = mods.reduce((a, m) => a + m.completed, 0);
  const totalClassesRequired = modules.reduce((a, m) => a + (m.estimated_classes || 0), 0);
  const classesCompleted = sessions.reduce((a, s) => a + (s.classes_used || 0), 0);

  const actualPercent = pct(completedTopics, totalTopics);
  const expectedPercent = expectedProgress(subject.start_date, subject.end_date, now);
  const availableWeeks = weeksBetween(subject.start_date, subject.end_date);
  const start = toDate(subject.start_date);
  const weeksElapsed = start
    ? Math.max(0, Math.floor((now.getTime() - start.getTime()) / (7 * DAY)))
    : 0;
  const weeksRemaining = Math.max(0, availableWeeks - weeksElapsed);
  const remainingTopics = totalTopics - completedTopics;

  return {
    subject,
    modules: mods,
    totalModules: modules.length,
    totalTopics,
    completedTopics,
    remainingTopics,
    totalClassesRequired,
    classesCompleted,
    classesRemaining: Math.max(0, (subject.total_classes || totalClassesRequired) - classesCompleted),
    actualPercent,
    expectedPercent,
    status: scheduleStatus(actualPercent, expectedPercent),
    availableWeeks,
    weeksElapsed,
    weeksRemaining,
    weeklyTarget: weeksRemaining > 0 ? Math.ceil(remainingTopics / weeksRemaining) : remainingTopics,
    classesPerWeek: subject.classes_per_week || 0,
  };
}

export type PlannedWeek = {
  week: number;
  moduleNumbers: number[];
  label: string;
};

/** Distribute module classes across weeks using classes-per-week. */
export function plannedSchedule(
  modules: ModuleWithTopics[],
  classesPerWeek: number,
): PlannedWeek[] {
  const perWeek = Math.max(1, classesPerWeek || 1);
  const queue = [...modules]
    .sort((a, b) => a.module_number - b.module_number)
    .map((m) => ({
      number: m.module_number,
      name: m.module_name,
      left: Math.max(1, m.estimated_classes || 1),
    }));

  const weeks: PlannedWeek[] = [];
  let week = 1;
  while (queue.some((m) => m.left > 0) && week <= 60) {
    let capacity = perWeek;
    const covered: { number: number; name: string }[] = [];
    while (capacity > 0) {
      const next = queue.find((m) => m.left > 0);
      if (!next) break;
      const used = Math.min(capacity, next.left);
      next.left -= used;
      capacity -= used;
      if (!covered.some((c) => c.number === next.number)) {
        covered.push({ number: next.number, name: next.name });
      }
    }
    weeks.push({
      week,
      moduleNumbers: covered.map((c) => c.number),
      label: covered.map((c) => `Module ${c.number} — ${c.name || "Untitled"}`).join(" · "),
    });
    week += 1;
  }
  return weeks;
}

export type PlannerTip = { icon: string; text: string; tone: "info" | "warn" | "good" | "goal" };

export function plannerTips(stats: SubjectStats): PlannerTip[] {
  const tips: PlannerTip[] = [];
  const { remainingTopics, totalTopics, status, actualPercent, expectedPercent } = stats;

  if (totalTopics === 0) {
    return [
      {
        icon: "💡",
        text: "Add modules and topics to your syllabus to start receiving pacing advice.",
        tone: "info",
      },
    ];
  }

  tips.push({
    icon: "💡",
    text:
      remainingTopics === 0
        ? `All ${totalTopics} topics are complete. Your syllabus is finished.`
        : `You have ${remainingTopics} topic${remainingTopics === 1 ? "" : "s"} remaining out of ${totalTopics}.`,
    tone: "info",
  });

  if (status === "behind") {
    tips.push({
      icon: "⚠",
      text: `You are ${expectedPercent - actualPercent} points behind your planned schedule.`,
      tone: "warn",
    });
  } else if (status === "ahead") {
    tips.push({
      icon: "✅",
      text: `You are ${actualPercent - expectedPercent} points ahead of your plan. Keep the pace.`,
      tone: "good",
    });
  } else if (remainingTopics > 0) {
    tips.push({
      icon: "✅",
      text: `You are on schedule — actual ${actualPercent}% against an expected ${expectedPercent}%.`,
      tone: "good",
    });
  }

  const heaviest = [...stats.modules].sort((a, b) => b.remaining - a.remaining)[0];
  if (heaviest && heaviest.remaining > 0) {
    tips.push({
      icon: "📚",
      text: `Module ${heaviest.module.module_number} — ${heaviest.module.module_name || "Untitled"} has the most remaining topics (${heaviest.remaining} of ${heaviest.total}).`,
      tone: "info",
    });
  }

  if (remainingTopics > 0) {
    tips.push({
      icon: "🎯",
      text:
        stats.weeksRemaining > 0
          ? `Try to complete ${stats.weeklyTarget} topic${stats.weeklyTarget === 1 ? "" : "s"} this week — ${stats.weeksRemaining} week${stats.weeksRemaining === 1 ? "" : "s"} left before your completion date.`
          : `Your completion date has passed with ${remainingTopics} topic${remainingTopics === 1 ? "" : "s"} left. Consider extending the end date.`,
      tone: "goal",
    });
  }

  if (stats.classesRemaining <= 0 && remainingTopics > 0) {
    tips.push({
      icon: "🗓",
      text: "You have used all available classes but topics remain. Increase total classes available.",
      tone: "warn",
    });
  }

  return tips;
}

export function formatDate(value: string | null): string {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
