import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { SubjectSwitcher } from "@/components/acadify/SubjectSwitcher";
import { EmptyState, Panel, SectionHeading, StatCard } from "@/components/acadify/primitives";
import { useSyllabus, useTeacher } from "@/hooks/use-acadify";
import {
  formatDate,
  plannerTips,
  statusLabel,
  subjectStats,
  type SubjectStats,
} from "@/lib/acadify";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Acadify" },
      {
        name: "description",
        content:
          "Generate and download a syllabus completion report with module, topic and pacing details.",
      },
      { property: "og:title", content: "Reports — Acadify" },
      { property: "og:description", content: "Generate a shareable syllabus progress report." },
    ],
  }),
  component: ReportsPage,
});

function buildReport(stats: SubjectStats, teacherName: string): string {
  const lines: string[] = [];
  lines.push("ACADIFY — SYLLABUS PROGRESS REPORT");
  lines.push("Plan. Teach. Track. Complete.");
  lines.push("");
  lines.push(`Teacher: ${teacherName}`);
  lines.push(`Generated: ${formatDate(new Date().toISOString().slice(0, 10))}`);
  lines.push("");
  lines.push(`Subject: ${stats.subject.subject_name} (${stats.subject.subject_code || "—"})`);
  lines.push(`Department: ${stats.subject.department || "—"}`);
  lines.push(
    `Semester: ${stats.subject.semester || "—"}    Academic year: ${stats.subject.academic_year || "—"}`,
  );
  lines.push(
    `Duration: ${formatDate(stats.subject.start_date)} to ${formatDate(stats.subject.end_date)} (${stats.availableWeeks} weeks)`,
  );
  lines.push(
    `Total classes: ${stats.subject.total_classes}    Classes per week: ${stats.classesPerWeek}`,
  );
  lines.push("");
  lines.push("SUMMARY");
  lines.push(`  Modules: ${stats.totalModules}`);
  lines.push(`  Topics completed: ${stats.completedTopics} / ${stats.totalTopics}`);
  lines.push(`  Classes recorded: ${stats.classesCompleted} (${stats.classesRemaining} remaining)`);
  lines.push(`  Actual progress: ${stats.actualPercent}%`);
  lines.push(`  Expected progress: ${stats.expectedPercent}%`);
  lines.push(`  Status: ${statusLabel[stats.status]}`);
  lines.push(`  Weekly target: ${stats.weeklyTarget} topics over ${stats.weeksRemaining} weeks`);
  lines.push("");
  lines.push("MODULE DETAIL");
  stats.modules.forEach((m) => {
    lines.push(
      `  Module ${m.module.module_number}: ${m.module.module_name || "Untitled"} — ${m.completed}/${m.total} topics (${m.percent}%), ${m.module.estimated_classes} est. classes`,
    );
    m.module.topics.forEach((t) => {
      lines.push(
        `      [${t.completed ? "x" : " "}] ${t.topic_name || "Untitled"} — ${t.estimated_classes} class(es)${t.completed ? ` — completed ${formatDate(t.completed_date)}` : ""}`,
      );
    });
  });
  lines.push("");
  lines.push("SMART PLANNER RECOMMENDATIONS");
  plannerTips(stats).forEach((tip) => lines.push(`  - ${tip.text}`));
  lines.push("");
  return lines.join("\n");
}

function ReportsPage() {
  const { data: teacher } = useTeacher();
  const { data: bundles, isLoading } = useSyllabus();
  const [activeId, setActiveId] = useState("");
  const [report, setReport] = useState("");

  const active = useMemo(() => {
    if (!bundles?.length) return null;
    return bundles.find((b) => b.subject.subject_id === activeId) ?? bundles[0];
  }, [bundles, activeId]);

  const stats = useMemo(
    () => (active ? subjectStats(active.subject, active.modules, active.sessions) : null),
    [active],
  );

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (!stats || !active) {
    return (
      <EmptyState
        title="No report available"
        description="Set up your syllabus to generate progress reports."
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

  function generate() {
    if (!stats) return;
    setReport(buildReport(stats, teacher?.name || "Teacher"));
    toast.success("Report generated.");
  }

  function download() {
    if (!stats) return;
    const text = report || buildReport(stats, teacher?.name || "Teacher");
    setReport(text);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `acadify-${(stats.subject.subject_name || "subject").toLowerCase().replace(/\s+/g, "-")}-report.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded.");
  }

  return (
    <div>
      <SectionHeading
        title="Reports"
        subtitle="Generate a full syllabus report from your recorded progress, then download it."
        action={
          <div className="flex gap-2">
            <button
              onClick={generate}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Generate report
            </button>
            <button
              onClick={download}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-primary ring-1 ring-primary/30 hover:bg-primary/10"
            >
              Download
            </button>
          </div>
        }
      />
      <SubjectSwitcher
        bundles={bundles ?? []}
        activeId={active.subject.subject_id}
        onChange={(id) => {
          setActiveId(id);
          setReport("");
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Subject" value={stats.subject.subject_name} />
        <StatCard label="Completion" value={`${stats.actualPercent}%`} highlight />
        <StatCard label="Status" value={statusLabel[stats.status]} />
        <StatCard label="Classes recorded" value={stats.classesCompleted} />
      </div>

      <Panel className="mt-5 p-5">
        <h2 className="font-display text-lg font-medium">Report preview</h2>
        {report ? (
          <pre className="mt-4 max-h-[28rem] overflow-auto rounded-xl bg-black/30 p-4 text-xs leading-relaxed text-muted-foreground ring-1 ring-border">
            {report}
          </pre>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Select “Generate report” to build a full breakdown of modules, topics, pacing and
            planner recommendations.
          </p>
        )}
      </Panel>
    </div>
  );
}
