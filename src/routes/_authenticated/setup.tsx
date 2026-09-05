import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { SyllabusForm } from "@/components/acadify/SyllabusForm";
import { SectionHeading } from "@/components/acadify/primitives";
import { useTeacher } from "@/hooks/use-acadify";
import { emptyDraft } from "@/lib/syllabus";

export const Route = createFileRoute("/_authenticated/setup")({
  head: () => ({
    meta: [
      { title: "Syllabus Setup — Acadify" },
      {
        name: "description",
        content:
          "Enter subject details, modules, topics, estimated classes and dates to build your teaching plan.",
      },
      { property: "og:title", content: "Syllabus Setup — Acadify" },
      { property: "og:description", content: "Build your syllabus plan in one guided form." },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const { data: teacher, isLoading } = useTeacher();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <SectionHeading
        title="Syllabus Setup"
        subtitle="Add your subject, modules and topics. Totals and the weekly plan update as you type."
      />
      <SyllabusForm
        mode="setup"
        initial={emptyDraft(teacher?.department ?? "")}
        onSaved={() => navigate({ to: "/dashboard" })}
      />
    </div>
  );
}
