import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { ModuleList } from "@/components/acadify/ModuleList";
import { SubjectSwitcher } from "@/components/acadify/SubjectSwitcher";
import {
  EmptyState,
  PaceRow,
  Panel,
  SectionHeading,
  StatCard,
  StatusBadge,
} from "@/components/acadify/primitives";
import { useSyllabus, useTeacher } from "@/hooks/use-acadify";
import { formatDate, plannerTips, subjectStats } from "@/lib/acadify";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Acadify Syllabus Tracker" },
      {
        name: "description",
        content:
          "See overall syllabus progress, expected versus actual pace, schedule status and smart planner recommendations.",
      },
      { property: "og:title", content: "Dashboard — Acadify Syllabus Tracker" },
      {
        property: "og:description",
        content: "Track your syllabus progress and pacing at a glance.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { data: teacher } = useTeacher();
  const { data: bundles, isLoading } = useSyllabus();
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (teacher && !teacher.setup_complete) {
      navigate({ to: "/setup", replace: true });
    }
  }, [teacher, navigate]);

  const active = useMemo(() => {
    if (!bundles?.length) return null;
    return bundles.find((b) => b.subject.subject_id === activeId) ?? bundles[0];
  }, [bundles, activeId]);

  const stats = useMemo(
    () => (active ? subjectStats(active.subject, active.modules, active.sessions) : null),
    [active],
  );

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading your syllabus…</p>;
  }

  if (!stats || !active) {
    return (
      <EmptyState
        title="No syllabus yet"
        description="Set up your subject, modules and topics to start tracking teaching progress."
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
        title={`Welcome back, ${teacher?.name?.split(" ")[0] || "Teacher"}`}
        subtitle="Plan. Teach. Track. Complete."
        action={
          <Link
            to="/record-class"
            className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Record a class
          </Link>
        }
      />

      <SubjectSwitcher bundles={bundles ?? []} activeId={active.subject.subject_id} onChange={setActiveId} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Modules" value={stats.totalModules} hint={`${stats.totalTopics} topics planned`} />
        <StatCard
          label="Topics completed"
          value={`${stats.completedTopics}/${stats.totalTopics}`}
          hint={`${stats.remainingTopics} remaining`}
        />
        <StatCard
          label="Classes taken"
          value={stats.classesCompleted}
          hint={`${stats.classesRemaining} of ${stats.subject.total_classes} left`}
        />
        <StatCard
          label="Weekly target"
          value={`${stats.weeklyTarget} topics`}
          hint={`${stats.weeksRemaining} weeks remaining`}
          highlight
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-medium">
                {stats.subject.subject_name}
                {stats.subject.subject_code ? ` (${stats.subject.subject_code})` : ""}
              </h2>
              <p className="text-xs text-fog">
                {formatDate(stats.subject.start_date)} → {formatDate(stats.subject.end_date)} ·{" "}
                {stats.classesPerWeek} classes/week
              </p>
            </div>
            <StatusBadge status={stats.status} />
          </div>

          <div className="mt-5 flex items-end gap-4">
            <p className="font-display text-5xl font-semibold text-primary">{stats.actualPercent}%</p>
            <p className="pb-2 text-xs text-muted-foreground">overall syllabus completion</p>
          </div>

          <div className="mt-5 space-y-4">
            <PaceRow label="Actual progress" value={stats.actualPercent} tone="primary" />
            <PaceRow label="Expected by today" value={stats.expectedPercent} />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            You are {Math.abs(stats.actualPercent - stats.expectedPercent)} percentage points{" "}
            {stats.actualPercent >= stats.expectedPercent ? "above" : "below"} the date-based
            expectation.
          </p>
        </Panel>

        <Panel className="p-5">
          <h2 className="font-display text-lg font-medium">Acadify Smart Planner</h2>
          <ul className="mt-4 space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span aria-hidden>{tip.icon}</span>
                <span
                  className={
                    tip.tone === "warn"
                      ? "text-destructive"
                      : tip.tone === "good"
                        ? "text-primary"
                        : tip.tone === "goal"
                          ? "text-accent"
                          : "text-muted-foreground"
                  }
                >
                  {tip.text}
                </span>
              </li>
            ))}
          </ul>
          <Link
            to="/edit-syllabus"
            className="mt-5 inline-flex rounded-lg px-3 py-2 text-xs font-semibold text-primary ring-1 ring-primary/30 hover:bg-primary/10"
          >
            EDIT SYLLABUS
          </Link>
        </Panel>
      </div>

      <div className="mt-5">
        <ModuleList stats={stats} />
      </div>
    </div>
  );
}
