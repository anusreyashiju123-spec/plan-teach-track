import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ModuleList } from "@/components/acadify/ModuleList";
import { SubjectSwitcher } from "@/components/acadify/SubjectSwitcher";
import { EmptyState, SectionHeading, StatCard } from "@/components/acadify/primitives";
import { useSyllabus } from "@/hooks/use-acadify";
import { subjectStats } from "@/lib/acadify";

export const Route = createFileRoute("/_authenticated/modules")({
  head: () => ({
    meta: [
      { title: "Modules — Acadify" },
      {
        name: "description",
        content: "Add, edit and delete syllabus modules and see how far each one has progressed.",
      },
      { property: "og:title", content: "Modules — Acadify" },
      { property: "og:description", content: "Manage your syllabus modules and their topics." },
    ],
  }),
  component: ModulesPage,
});

function ModulesPage() {
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

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading modules…</p>;

  if (!stats || !active) {
    return (
      <EmptyState
        title="No modules yet"
        description="Set up your syllabus first, then manage modules here."
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
        title="Modules"
        subtitle={`${stats.subject.subject_name} — edit module names, numbers and estimated classes.`}
      />
      <SubjectSwitcher
        bundles={bundles ?? []}
        activeId={active.subject.subject_id}
        onChange={setActiveId}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Modules" value={stats.totalModules} />
        <StatCard label="Estimated classes" value={stats.totalClassesRequired} />
        <StatCard
          label="Completion"
          value={`${stats.actualPercent}%`}
          hint={`${stats.completedTopics} of ${stats.totalTopics} topics`}
          highlight
        />
      </div>

      <div className="mt-5">
        <ModuleList stats={stats} />
      </div>
    </div>
  );
}
