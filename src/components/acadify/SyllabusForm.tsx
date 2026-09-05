import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Panel, StatCard } from "@/components/acadify/primitives";
import { plannedSchedule, weeksBetween, type ModuleWithTopics } from "@/lib/acadify";
import { saveSyllabus, type SyllabusDraft } from "@/lib/syllabus";
import { useAcadifyRefresh } from "@/hooks/use-acadify";

const field =
  "w-full rounded-lg bg-input px-3 py-2.5 text-sm ring-1 ring-border placeholder:text-fog focus:ring-ring focus:outline-none";
const label = "mb-1.5 block text-xs font-medium text-muted-foreground";

export function SyllabusForm({
  initial,
  mode,
  onSaved,
  onCancel,
}: {
  initial: SyllabusDraft;
  mode: "setup" | "edit";
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState<SyllabusDraft>(initial);
  const [busy, setBusy] = useState(false);
  const refresh = useAcadifyRefresh();

  const set = <K extends keyof SyllabusDraft>(key: K, value: SyllabusDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const totals = useMemo(() => {
    const totalTopics = draft.modules.reduce(
      (a, m) => a + m.topics.filter((t) => t.topic_name.trim()).length,
      0,
    );
    const totalClasses = draft.modules.reduce((a, m) => a + (m.estimated_classes || 0), 0);
    const weeks = weeksBetween(draft.start_date || null, draft.end_date || null);
    const schedule = plannedSchedule(
      draft.modules.map((m, i) => ({
        module_id: String(i),
        subject_id: "",
        module_number: m.module_number || i + 1,
        module_name: m.module_name,
        estimated_classes: m.estimated_classes,
        topics: [],
      })) as ModuleWithTopics[],
      draft.classes_per_week,
    );
    return {
      totalTopics,
      totalClasses,
      weeks,
      weeklyProgress: weeks > 0 ? Math.round(100 / weeks) : 0,
      schedule,
    };
  }, [draft]);

  function updateModule(index: number, patch: Partial<SyllabusDraft["modules"][number]>) {
    setDraft((d) => ({
      ...d,
      modules: d.modules.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));
  }

  function addModule() {
    setDraft((d) => ({
      ...d,
      modules: [
        ...d.modules,
        {
          module_number: d.modules.length + 1,
          module_name: "",
          estimated_classes: 6,
          topics: [{ topic_name: "", estimated_classes: 1 }],
        },
      ],
    }));
  }

  function removeModule(index: number) {
    if (!window.confirm("Delete this module and all of its topics?")) return;
    setDraft((d) => ({ ...d, modules: d.modules.filter((_, i) => i !== index) }));
  }

  function addTopic(mIndex: number) {
    setDraft((d) => ({
      ...d,
      modules: d.modules.map((m, i) =>
        i === mIndex ? { ...m, topics: [...m.topics, { topic_name: "", estimated_classes: 1 }] } : m,
      ),
    }));
  }

  function removeTopic(mIndex: number, tIndex: number) {
    if (!window.confirm("Delete this topic?")) return;
    setDraft((d) => ({
      ...d,
      modules: d.modules.map((m, i) =>
        i === mIndex ? { ...m, topics: m.topics.filter((_, j) => j !== tIndex) } : m,
      ),
    }));
  }

  async function handleSave() {
    if (!draft.subject_name.trim()) {
      toast.error("Please enter the subject name.");
      return;
    }
    if (!draft.start_date || !draft.end_date) {
      toast.error("Please add a start date and an expected completion date.");
      return;
    }
    if (new Date(draft.end_date) <= new Date(draft.start_date)) {
      toast.error("The completion date must be after the start date.");
      return;
    }
    const cleaned: SyllabusDraft = {
      ...draft,
      modules: draft.modules
        .filter((m) => m.module_name.trim() || m.topics.some((t) => t.topic_name.trim()))
        .map((m, i) => ({
          ...m,
          module_number: m.module_number || i + 1,
          topics: m.topics.filter((t) => t.topic_name.trim()),
        })),
    };
    if (!cleaned.modules.length) {
      toast.error("Add at least one module with a topic.");
      return;
    }

    setBusy(true);
    try {
      await saveSyllabus(cleaned);
      refresh();
      toast.success(mode === "setup" ? "Syllabus saved." : "Changes saved and progress recalculated.");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the syllabus.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Subject details */}
      <Panel className="p-6">
        <h2 className="font-display text-lg font-medium">Subject Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2">
            <label className={label} htmlFor="subject_name">
              Subject Name
            </label>
            <input
              id="subject_name"
              className={field}
              maxLength={120}
              placeholder="Database Management System"
              value={draft.subject_name}
              onChange={(e) => set("subject_name", e.target.value)}
            />
          </div>
          <div>
            <label className={label} htmlFor="subject_code">
              Subject Code
            </label>
            <input
              id="subject_code"
              className={field}
              maxLength={30}
              placeholder="CST301"
              value={draft.subject_code}
              onChange={(e) => set("subject_code", e.target.value)}
            />
          </div>
          <div>
            <label className={label} htmlFor="department">
              Department
            </label>
            <input
              id="department"
              className={field}
              maxLength={80}
              placeholder="Computer Science"
              value={draft.department}
              onChange={(e) => set("department", e.target.value)}
            />
          </div>
          <div>
            <label className={label} htmlFor="semester">
              Semester
            </label>
            <input
              id="semester"
              className={field}
              maxLength={20}
              placeholder="3"
              value={draft.semester}
              onChange={(e) => set("semester", e.target.value)}
            />
          </div>
          <div>
            <label className={label} htmlFor="academic_year">
              Academic Year
            </label>
            <input
              id="academic_year"
              className={field}
              maxLength={20}
              placeholder="2026–27"
              value={draft.academic_year}
              onChange={(e) => set("academic_year", e.target.value)}
            />
          </div>
        </div>
      </Panel>

      {/* Modules */}
      <Panel className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-medium">Modules &amp; Topics</h2>
          <button
            onClick={addModule}
            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground ring-1 ring-primary/50 hover:bg-primary/90"
          >
            + Add Module
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {draft.modules.map((mod, mIndex) => (
            <div key={mIndex} className="glass-strong rounded-xl p-4">
              <div className="grid gap-3 sm:grid-cols-[80px_1fr_140px_auto] sm:items-end">
                <div>
                  <label className={label}>Module No.</label>
                  <input
                    type="number"
                    min={1}
                    className={field}
                    value={mod.module_number}
                    onChange={(e) =>
                      updateModule(mIndex, { module_number: Number(e.target.value) || 1 })
                    }
                  />
                </div>
                <div>
                  <label className={label}>Module Name</label>
                  <input
                    className={field}
                    maxLength={120}
                    placeholder="Introduction to DBMS"
                    value={mod.module_name}
                    onChange={(e) => updateModule(mIndex, { module_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className={label}>Classes Required</label>
                  <input
                    type="number"
                    min={0}
                    className={field}
                    value={mod.estimated_classes}
                    onChange={(e) =>
                      updateModule(mIndex, { estimated_classes: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <button
                  onClick={() => removeModule(mIndex)}
                  className="rounded-lg px-3 py-2.5 text-xs font-medium text-destructive ring-1 ring-destructive/30 hover:bg-destructive/10"
                >
                  Delete
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {mod.topics.map((topic, tIndex) => (
                  <div key={tIndex} className="flex items-center gap-2">
                    <span className="text-xs text-fog">•</span>
                    <input
                      className={field}
                      maxLength={140}
                      placeholder="Topic name"
                      value={topic.topic_name}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          modules: d.modules.map((m, i) =>
                            i === mIndex
                              ? {
                                  ...m,
                                  topics: m.topics.map((t, j) =>
                                    j === tIndex ? { ...t, topic_name: e.target.value } : t,
                                  ),
                                }
                              : m,
                          ),
                        }))
                      }
                    />
                    <input
                      type="number"
                      min={1}
                      className="w-20 rounded-lg bg-input px-3 py-2.5 text-sm ring-1 ring-border focus:ring-ring focus:outline-none"
                      value={topic.estimated_classes}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          modules: d.modules.map((m, i) =>
                            i === mIndex
                              ? {
                                  ...m,
                                  topics: m.topics.map((t, j) =>
                                    j === tIndex
                                      ? { ...t, estimated_classes: Number(e.target.value) || 1 }
                                      : t,
                                  ),
                                }
                              : m,
                          ),
                        }))
                      }
                    />
                    <button
                      onClick={() => removeTopic(mIndex, tIndex)}
                      className="shrink-0 rounded-lg px-2 py-2 text-xs text-destructive hover:bg-destructive/10"
                      aria-label="Delete topic"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addTopic(mIndex)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/30 hover:bg-primary/10"
                >
                  + Add Topic
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Teaching time */}
      <Panel className="p-6">
        <h2 className="font-display text-lg font-medium">Teaching Time Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">When do you want to finish the syllabus?</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={label} htmlFor="start_date">
              Start Date
            </label>
            <input
              id="start_date"
              type="date"
              className={field}
              value={draft.start_date}
              onChange={(e) => set("start_date", e.target.value)}
            />
          </div>
          <div>
            <label className={label} htmlFor="end_date">
              Expected Completion Date
            </label>
            <input
              id="end_date"
              type="date"
              className={field}
              value={draft.end_date}
              onChange={(e) => set("end_date", e.target.value)}
            />
          </div>
          <div>
            <label className={label} htmlFor="total_classes">
              Total Classes Available
            </label>
            <input
              id="total_classes"
              type="number"
              min={0}
              className={field}
              value={draft.total_classes}
              onChange={(e) => set("total_classes", Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className={label} htmlFor="classes_per_week">
              Classes Per Week
            </label>
            <input
              id="classes_per_week"
              type="number"
              min={1}
              className={field}
              value={draft.classes_per_week}
              onChange={(e) => set("classes_per_week", Number(e.target.value) || 1)}
            />
          </div>
        </div>
      </Panel>

      {/* Automatic planning */}
      <Panel className="p-6">
        <h2 className="font-display text-lg font-medium">Automatic Syllabus Planning</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="Total Modules" value={draft.modules.length} />
          <StatCard label="Total Topics" value={totals.totalTopics} />
          <StatCard label="Classes Required" value={totals.totalClasses} />
          <StatCard label="Available Weeks" value={totals.weeks} />
          <StatCard label="Classes / Week" value={draft.classes_per_week} />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Expected weekly progress: {totals.weeklyProgress}% of the syllabus per week.
        </p>

        {totals.schedule.length ? (
          <div className="mt-4 max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {totals.schedule.map((w) => (
              <div
                key={w.week}
                className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-xs"
              >
                <span className="text-muted-foreground">Week {w.week}</span>
                <span className="text-right">{w.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </Panel>

      <div className="flex flex-wrap gap-3 pb-6">
        <button
          onClick={handleSave}
          disabled={busy}
          className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground ring-1 ring-primary/50 hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? "Saving…" : mode === "setup" ? "SAVE & GO TO DASHBOARD" : "SAVE CHANGES"}
        </button>
        {onCancel ? (
          <button
            onClick={onCancel}
            className="rounded-lg px-5 py-3 text-sm font-semibold text-muted-foreground ring-1 ring-border hover:bg-muted"
          >
            CANCEL
          </button>
        ) : null}
      </div>
    </div>
  );
}
