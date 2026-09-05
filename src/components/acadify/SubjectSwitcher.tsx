import { cn } from "@/lib/utils";
import type { SubjectBundle } from "@/lib/syllabus";

export function SubjectSwitcher({
  bundles,
  activeId,
  onChange,
}: {
  bundles: SubjectBundle[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  if (bundles.length < 2) return null;
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {bundles.map((b) => (
        <button
          key={b.subject.subject_id}
          onClick={() => onChange(b.subject.subject_id)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 transition-colors",
            b.subject.subject_id === activeId
              ? "bg-primary/15 text-primary ring-primary/30"
              : "text-muted-foreground ring-border hover:bg-muted",
          )}
        >
          {b.subject.subject_name}
        </button>
      ))}
    </div>
  );
}
