import { useState } from "react";
import { toast } from "sonner";

import { Bar, Panel } from "@/components/acadify/primitives";
import { formatDate, type SubjectStats } from "@/lib/acadify";
import {
  addModule,
  addTopic,
  deleteModule,
  deleteTopic,
  setTopicCompleted,
  updateModule,
  updateTopic,
} from "@/lib/syllabus";
import { useAcadifyRefresh } from "@/hooks/use-acadify";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-lg bg-input px-3 py-2 text-sm ring-1 ring-border focus:ring-ring focus:outline-none";

export function ModuleList({
  stats,
  editable = true,
  defaultExpandedFirst = true,
}: {
  stats: SubjectStats;
  editable?: boolean;
  defaultExpandedFirst?: boolean;
}) {
  const refresh = useAcadifyRefresh();
  const first = stats.modules[0]?.module.module_id;
  const [expanded, setExpanded] = useState<string[]>(
    defaultExpandedFirst && first ? [first] : [],
  );
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>, message?: string) {
    setBusy(true);
    try {
      await action();
      refresh();
      if (message) toast.success(message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const toggleExpanded = (id: string) =>
    setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-display text-lg font-medium">Module Progress</h2>
        {editable ? (
          <button
            disabled={busy}
            onClick={() =>
              run(
                () => addModule(stats.subject.subject_id, stats.modules.length + 1),
                "Module added.",
              )
            }
            className="text-xs font-medium text-primary hover:underline"
          >
            + Add Module
          </button>
        ) : null}
      </div>

      {stats.modules.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          No modules yet. Add your first module to start tracking.
        </p>
      ) : null}

      {stats.modules.map((m) => {
        const open = expanded.includes(m.module.module_id);
        return (
          <div key={m.module.module_id} className="border-b border-border last:border-b-0">
            <div className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-lg font-display text-sm font-semibold",
                  m.percent > 0
                    ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                    : "bg-muted text-muted-foreground ring-1 ring-border",
                )}
              >
                M{m.module.module_number}
              </div>

              {editingModule === m.module.module_id ? (
                <ModuleEditor
                  initial={{
                    module_number: m.module.module_number,
                    module_name: m.module.module_name,
                    estimated_classes: m.module.estimated_classes,
                  }}
                  onCancel={() => setEditingModule(null)}
                  onSave={(values) =>
                    run(async () => {
                      await updateModule(m.module.module_id, values);
                      setEditingModule(null);
                    }, "Module updated.")
                  }
                />
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {m.module.module_name || "Untitled module"}
                    </p>
                    <p className="text-xs text-fog">
                      {m.total} topics · {m.module.estimated_classes} classes · {m.completed}{" "}
                      completed · {m.remaining} remaining
                    </p>
                  </div>
                  <div className="hidden w-40 items-center gap-3 sm:flex">
                    <div className="flex-1">
                      <Bar value={m.percent} />
                    </div>
                    <span className="w-8 text-right text-xs text-muted-foreground">
                      {m.percent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpanded(m.module.module_id)}
                      className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-primary ring-1 ring-primary/30 hover:bg-primary/10"
                    >
                      {open ? "HIDE TOPICS" : "VIEW TOPICS"}
                    </button>
                    {editable ? (
                      <>
                        <button
                          onClick={() => setEditingModule(m.module.module_id)}
                          className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-muted-foreground ring-1 ring-border hover:bg-muted"
                        >
                          EDIT
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete Module ${m.module.module_number} and all ${m.total} of its topics? This cannot be undone.`,
                              )
                            ) {
                              run(() => deleteModule(m.module.module_id), "Module deleted.");
                            }
                          }}
                          className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-destructive ring-1 ring-destructive/30 hover:bg-destructive/10"
                        >
                          ✕
                        </button>
                      </>
                    ) : null}
                  </div>
                </>
              )}
            </div>

            {open ? (
              <div className="px-5 pb-5">
                <p className="mb-3 text-xs uppercase tracking-wide text-fog">
                  Module {m.module.module_number} – {m.module.module_name || "Untitled"}
                </p>
                {m.module.topics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No topics in this module yet.</p>
                ) : null}
                <ul className="space-y-2">
                  {m.module.topics.map((t) => (
                    <li key={t.topic_id} className="flex flex-wrap items-center gap-3">
                      <button
                        disabled={busy}
                        onClick={() =>
                          run(
                            () => setTopicCompleted(t.topic_id, !t.completed),
                            t.completed ? "Marked as incomplete." : "Topic completed.",
                          )
                        }
                        aria-label={t.completed ? "Mark incomplete" : "Mark complete"}
                        className={cn(
                          "grid size-[18px] shrink-0 place-items-center rounded-[5px] text-[10px] transition-colors",
                          t.completed
                            ? "bg-primary/20 text-primary ring-1 ring-primary/50"
                            : "ring-1 ring-border hover:ring-primary/50",
                        )}
                      >
                        {t.completed ? "✓" : ""}
                      </button>

                      {editingTopic === t.topic_id ? (
                        <TopicEditor
                          initial={{
                            topic_name: t.topic_name,
                            estimated_classes: t.estimated_classes,
                          }}
                          onCancel={() => setEditingTopic(null)}
                          onSave={(values) =>
                            run(async () => {
                              await updateTopic(t.topic_id, values);
                              setEditingTopic(null);
                            }, "Topic updated.")
                          }
                        />
                      ) : (
                        <>
                          <span
                            className={cn(
                              "min-w-0 flex-1 text-sm",
                              t.completed && "text-fog line-through",
                            )}
                          >
                            {t.topic_name || "Untitled topic"}
                          </span>
                          <span className="text-[11px] text-fog">
                            {t.estimated_classes} class{t.estimated_classes === 1 ? "" : "es"}
                            {t.completed ? ` · done ${formatDate(t.completed_date)}` : ""}
                          </span>
                          {editable ? (
                            <>
                              <button
                                onClick={() => setEditingTopic(t.topic_id)}
                                className="rounded-md px-2 py-1 text-[11px] text-muted-foreground ring-1 ring-border hover:bg-muted"
                              >
                                Edit
                              </button>
                              <button
                                disabled={busy}
                                onClick={() => {
                                  if (window.confirm(`Delete the topic "${t.topic_name}"?`)) {
                                    run(() => deleteTopic(t.topic_id), "Topic deleted.");
                                  }
                                }}
                                className="rounded-md px-2 py-1 text-[11px] text-destructive hover:bg-destructive/10"
                              >
                                Delete
                              </button>
                            </>
                          ) : null}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                {editable ? (
                  <button
                    disabled={busy}
                    onClick={() =>
                      run(
                        () => addTopic(m.module.module_id, m.module.topics.length),
                        "Topic added.",
                      )
                    }
                    className="mt-3 rounded-lg px-3 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/30 hover:bg-primary/10"
                  >
                    + Add Topic
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </Panel>
  );
}

function ModuleEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: { module_number: number; module_name: string; estimated_classes: number };
  onSave: (values: {
    module_number: number;
    module_name: string;
    estimated_classes: number;
  }) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(initial);
  return (
    <div className="flex flex-1 flex-wrap items-center gap-2">
      <input
        type="number"
        min={1}
        className="w-16 rounded-lg bg-input px-2 py-2 text-sm ring-1 ring-border focus:outline-none"
        value={values.module_number}
        onChange={(e) => setValues({ ...values, module_number: Number(e.target.value) || 1 })}
      />
      <input
        className={cn(field, "min-w-40 flex-1")}
        maxLength={120}
        value={values.module_name}
        onChange={(e) => setValues({ ...values, module_name: e.target.value })}
      />
      <input
        type="number"
        min={0}
        className="w-20 rounded-lg bg-input px-2 py-2 text-sm ring-1 ring-border focus:outline-none"
        value={values.estimated_classes}
        onChange={(e) => setValues({ ...values, estimated_classes: Number(e.target.value) || 0 })}
      />
      <button
        onClick={() => onSave(values)}
        className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"
      >
        SAVE
      </button>
      <button
        onClick={onCancel}
        className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-muted-foreground ring-1 ring-border"
      >
        CANCEL
      </button>
    </div>
  );
}

function TopicEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: { topic_name: string; estimated_classes: number };
  onSave: (values: { topic_name: string; estimated_classes: number }) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(initial);
  return (
    <div className="flex flex-1 flex-wrap items-center gap-2">
      <input
        className={cn(field, "min-w-40 flex-1")}
        maxLength={140}
        value={values.topic_name}
        onChange={(e) => setValues({ ...values, topic_name: e.target.value })}
      />
      <input
        type="number"
        min={1}
        className="w-20 rounded-lg bg-input px-2 py-2 text-sm ring-1 ring-border focus:outline-none"
        value={values.estimated_classes}
        onChange={(e) => setValues({ ...values, estimated_classes: Number(e.target.value) || 1 })}
      />
      <button
        onClick={() => onSave(values)}
        className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"
      >
        SAVE
      </button>
      <button
        onClick={onCancel}
        className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-muted-foreground ring-1 ring-border"
      >
        CANCEL
      </button>
    </div>
  );
}
