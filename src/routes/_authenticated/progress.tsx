import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { SubjectSwitcher } from "@/components/acadify/SubjectSwitcher";
import {
  Bar,
  EmptyState,
  PaceRow,
  Panel,
  SectionHeading,
  StatCard,
  StatusBadge,
} from "@/components/acadify/primitives";
import { useSyllabus } from "@/hooks/use-acadify";
import { formatDate, plannedSchedule, plannerTips, subjectStats } from "@/lib/acadify";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Acadify" },
      {
        name: "description",
        content:
          "Compare actual completion with the date-based expectation and see your planned weekly schedule.",
      },
      { property: "og:title", content: "Progress — Acadify" },
      {
        property: "og:description",
        content: "Know whether you are ahead, on schedule or behind.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { data: bundles, isLoading } = useSyllabus();
  const [activeId, setActiveId] = useState("");

  const active = useMemo(() => {
    if (!bundles?.length) return null;
    return bundles.find((b) => b.subject.subject_id === activeId) ?? bundles[0];
  }, [bundles, activeId]);

  const stats = useMemo(
    () => (active ? subjectStats(active.subject, active.modules, active.sessions) : null),
    [active],
  );

  const schedule = useMemo(
    () => (active ? plannedSchedule(active.modules, active.subject.classes_per_week) : []),
    [active],
  );

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading progress…</p>;

  if (!stats || !active) {
    return (
      <EmptyState
        title="No progress to show"
        description="Once your syllabus is set up, pacing and schedule status appear here."
        action={
          <Link
            to="/setup"
            className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Set up syllabus
          </Link>
        }
      />
    );
  }

  const tips = plannerTips(stats);

  return (
    <div>
      <SectionHeading
        title="Progress"
        subtitle={`${stats.subject.subject_name} · ${formatDate(stats.subject.start_date)} → ${formatDate(stats.subject.end_date)}`}
        action={<StatusBadge status={stats.status} />}
      />
      <SubjectSwitcher
        bundles={bundles ?? []}
        activeId={active.subject.subject_id}
        onChange={setActiveId}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Actual progress" value={`${stats.actualPercent}%`} highlight />
        <StatCard label="Expected by today" value={`${stats.expectedPercent}%`} />
        <StatCard
          label="Weeks elapsed"
          value={`${stats.weeksElapsed}/${stats.availableWeeks}`}
          hint={`${stats.weeksRemaining} weeks remaining`}
        />
        <StatCard
          label="Weekly target"
          value={`${stats.weeklyTarget} topics`}
          hint={`${stats.classesPerWeek} classes per week`}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-medium">Expected vs actual</h2>
          <div className="mt-4 space-y-4">
            <PaceRow label="Actual progress" value={stats.actualPercent} tone="primary" />
            <PaceRow label="Expected by today" value={stats.expectedPercent} />
          </div>

          <h3 className="mt-7 font-display text-sm font-medium">Module completion</h3>
          <ul className="mt-3 space-y-3">
            {stats.modules.map((m) => (
              <li key={m.module.module_id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-xs text-muted-foreground">
                  M{m.module.module_number} {m.module.module_name}
                </span>
                <div className="flex-1">
                  <Bar value={m.percent} />
                </div>
                <span className="w-16 text-right text-xs text-fog">
                  {m.completed}/{m.total}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-5">
          <h2 className="font-display text-lg font-medium">Smart Planner</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-muted-foreground">
                <span aria-hidden>{tip.icon}</span>
                <span>{tip.text}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-5 p-5">
        <h2 className="font-display text-lg font-medium">Planned weekly schedule</h2>
        <p className="mt-1 text-xs text-fog">
          Based on {stats.classesPerWeek} classes per week across {stats.totalClassesRequired}{" "}
          estimated classes.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {schedule.map((w) => (
            <li
              key={w.week}
              className="flex gap-3 rounded-xl bg-black/20 px-3 py-2.5 text-sm ring-1 ring-border"
            >
              <span className="font-display text-xs text-primary">W{w.week}</span>
              <span className="text-muted-foreground">{w.label}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
