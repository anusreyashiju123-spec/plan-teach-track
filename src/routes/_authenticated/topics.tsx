import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ModuleList } from "@/components/acadify/ModuleList";
import { SubjectSwitcher } from "@/components/acadify/SubjectSwitcher";
import { EmptyState, SectionHeading, StatCard } from "@/components/acadify/primitives";
import { useSyllabus } from "@/hooks/use-acadify";
import { subjectStats } from "@/lib/acadify";

export const Route = createFileRoute("/_authenticated/topics")({
  head: () => ({
    meta: [
      { title: "Topics — Acadify" },
      {
        name: "description",
        content: "Mark topics complete, edit topic names and estimated classes, or remove topics.",
      },
      { property: "og:title", content: "Topics — Acadify" },
      { property: "og:description", content: "Track topic-by-topic teaching completion." },
    ],
  }),
  component: TopicsPage,
});

function TopicsPage() {
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

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading topics…</p>;

  if (!stats || !active) {
    return (
      <EmptyState
        title="No topics yet"
        description="Add modules and topics during syllabus setup to track them here."
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
        title="Topics"
        subtitle="Tick a topic the moment you finish teaching it — progress updates instantly."
      />
      <SubjectSwitcher
        bundles={bundles ?? []}
        activeId={active.subject.subject_id}
        onChange={setActiveId}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total topics" value={stats.totalTopics} />
        <StatCard label="Completed" value={stats.completedTopics} highlight />
        <StatCard
          label="Remaining"
          value={stats.remainingTopics}
          hint={`${stats.weeklyTarget} per week to finish on time`}
        />
      </div>

      <div className="mt-5">
        <ModuleList stats={stats} expandAll />
      </div>
    </div>
  );
}
