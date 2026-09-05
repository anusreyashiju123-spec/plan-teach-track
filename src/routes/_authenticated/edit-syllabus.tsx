import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { SubjectSwitcher } from "@/components/acadify/SubjectSwitcher";
import { SyllabusForm } from "@/components/acadify/SyllabusForm";
import { EmptyState, SectionHeading } from "@/components/acadify/primitives";
import { useSyllabus, useTeacher } from "@/hooks/use-acadify";
import { bundleToDraft, emptyDraft } from "@/lib/syllabus";

export const Route = createFileRoute("/_authenticated/edit-syllabus")({
  head: () => ({
    meta: [
      { title: "Edit Syllabus — Acadify" },
      {
        name: "description",
        content:
          "Update subject details, modules, topics, dates and class counts without losing completed progress.",
      },
      { property: "og:title", content: "Edit Syllabus — Acadify" },
      { property: "og:description", content: "Change any part of your syllabus plan anytime." },
    ],
  }),
  component: EditSyllabusPage,
});

function EditSyllabusPage() {
  const navigate = useNavigate();
  const { data: teacher } = useTeacher();
  const { data: bundles, isLoading } = useSyllabus();
  const [activeId, setActiveId] = useState("");

  const active = useMemo(() => {
    if (!bundles?.length) return null;
    return bundles.find((b) => b.subject.subject_id === activeId) ?? bundles[0];
  }, [bundles, activeId]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading syllabus…</p>;

  if (!active) {
    return (
      <EmptyState
        title="Nothing to edit yet"
        description="Create your syllabus first, then come back to change anything."
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
        title="Edit Syllabus"
        subtitle="Everything you entered during setup stays editable. Completed topics keep their progress."
      />
      <SubjectSwitcher
        bundles={bundles ?? []}
        activeId={active.subject.subject_id}
        onChange={setActiveId}
      />
      <SyllabusForm
        key={active.subject.subject_id}
        mode="edit"
        initial={active ? bundleToDraft(active) : emptyDraft(teacher?.department ?? "")}
        onSaved={() => navigate({ to: "/dashboard" })}
        onCancel={() => navigate({ to: "/dashboard" })}
      />
    </div>
  );
}
