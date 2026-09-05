import { createFileRoute, Link } from "@tanstack/react-router";

import {
  Bar,
  EmptyState,
  Panel,
  SectionHeading,
  StatusBadge,
} from "@/components/acadify/primitives";
import { useSyllabus } from "@/hooks/use-acadify";
import { formatDate, subjectStats } from "@/lib/acadify";

export const Route = createFileRoute("/_authenticated/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects — Acadify" },
      {
        name: "description",
        content: "All subjects you teach, with class counts, dates and completion status.",
      },
      { property: "og:title", content: "Subjects — Acadify" },
      { property: "og:description", content: "Review every subject in your teaching plan." },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const { data: bundles, isLoading } = useSyllabus();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading subjects…</p>;

  if (!bundles?.length) {
    return (
      <EmptyState
        title="No subjects yet"
        description="Create your syllabus to add your first subject."
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

  return (
    <div>
      <SectionHeading
        title="Subjects"
        subtitle="Everything you entered during setup stays viewable and editable here."
        action={
          <Link
            to="/edit-syllabus"
            className="inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-primary ring-1 ring-primary/30 hover:bg-primary/10"
          >
            Edit syllabus
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {bundles.map((b) => {
          const s = subjectStats(b.subject, b.modules, b.sessions);
          return (
            <Panel key={b.subject.subject_id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-medium">{s.subject.subject_name}</h2>
                  <p className="text-xs text-fog">
                    {s.subject.subject_code || "No code"} · {s.subject.department || "—"} ·{" "}
                    Semester {s.subject.semester || "—"} · {s.subject.academic_year || "—"}
                  </p>
                </div>
                <StatusBadge status={s.status} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <Detail label="Modules" value={String(s.totalModules)} />
                <Detail label="Topics" value={`${s.completedTopics}/${s.totalTopics}`} />
                <Detail label="Total classes" value={String(s.subject.total_classes)} />
                <Detail label="Per week" value={String(s.classesPerWeek)} />
                <Detail label="Starts" value={formatDate(s.subject.start_date)} />
                <Detail label="Ends" value={formatDate(s.subject.end_date)} />
                <Detail label="Weeks left" value={String(s.weeksRemaining)} />
                <Detail label="Classes taken" value={String(s.classesCompleted)} />
              </dl>

              <div className="mt-5 flex items-center gap-3">
                <div className="flex-1">
                  <Bar value={s.actualPercent} thick />
                </div>
                <span className="font-display text-sm text-primary">{s.actualPercent}%</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/modules"
                  className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-primary ring-1 ring-primary/30 hover:bg-primary/10"
                >
                  MODULES
                </Link>
                <Link
                  to="/topics"
                  className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-muted-foreground ring-1 ring-border hover:bg-muted"
                >
                  TOPICS
                </Link>
                <Link
                  to="/progress"
                  className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-muted-foreground ring-1 ring-border hover:bg-muted"
                >
                  PROGRESS
                </Link>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-fog">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
