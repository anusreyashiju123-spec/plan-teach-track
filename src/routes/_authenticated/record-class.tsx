import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState, Panel, SectionHeading, StatCard } from "@/components/acadify/primitives";
import { useAcadifyRefresh, useSyllabus } from "@/hooks/use-acadify";
import { formatDate, subjectStats } from "@/lib/acadify";
import { recordClass } from "@/lib/syllabus";

const field =
  "w-full rounded-lg bg-input px-3 py-2.5 text-sm ring-1 ring-border placeholder:text-fog focus:ring-ring focus:outline-none";
const label = "mb-1.5 block text-xs font-medium text-muted-foreground";

export const Route = createFileRoute("/_authenticated/record-class")({
  head: () => ({
    meta: [
      { title: "Record Class — Acadify" },
      {
        name: "description",
        content:
          "Log a taught class, mark the topic complete and update your syllabus progress instantly.",
      },
      { property: "og:title", content: "Record Class — Acadify" },
      { property: "og:description", content: "Log each class you teach in seconds." },
    ],
  }),
  component: RecordClassPage,
});

function RecordClassPage() {
  const navigate = useNavigate();
  const refresh = useAcadifyRefresh();
  const { data: bundles, isLoading } = useSyllabus();

  const [subjectId, setSubjectId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [classDate, setClassDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [classesUsed, setClassesUsed] = useState(1);
  const [notes, setNotes] = useState("");
  const [markComplete, setMarkComplete] = useState(true);
  const [busy, setBusy] = useState(false);

  const active = useMemo(() => {
    if (!bundles?.length) return null;
    return bundles.find((b) => b.subject.subject_id === subjectId) ?? bundles[0];
  }, [bundles, subjectId]);

  const activeModule = useMemo(
    () => active?.modules.find((m) => m.module_id === moduleId) ?? null,
    [active, moduleId],
  );

  const stats = useMemo(
    () => (active ? subjectStats(active.subject, active.modules, active.sessions) : null),
    [active],
  );

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (!active || !stats) {
    return (
      <EmptyState
        title="Nothing to record yet"
        description="Set up your syllabus first so classes can be linked to modules and topics."
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

  async function submit() {
    if (!active) return;
    if (classesUsed < 1) {
      toast.error("A class must count at least 1 session.");
      return;
    }
    if (!classDate) {
      toast.error("Please choose the class date.");
      return;
    }
    setBusy(true);
    try {
      await recordClass({
        subject_id: active.subject.subject_id,
        module_id: moduleId || null,
        topic_id: topicId || null,
        class_date: classDate,
        classes_used: classesUsed,
        notes: notes.trim(),
        markTopicComplete: markComplete && Boolean(topicId),
      });
      refresh();
      toast.success("Class recorded and progress updated.");
      setNotes("");
      setTopicId("");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not record the class.");
    } finally {
      setBusy(false);
    }
  }

  const recent = [...active.sessions]
    .sort((a, b) => b.class_date.localeCompare(a.class_date))
    .slice(0, 6);

  return (
    <div>
      <SectionHeading
        title="Record Class"
        subtitle="Each recorded class updates sessions taken, topic completion and overall progress."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Classes taken" value={stats.classesCompleted} />
        <StatCard label="Classes remaining" value={stats.classesRemaining} />
        <StatCard label="Progress" value={`${stats.actualPercent}%`} highlight />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Subject</label>
              <select
                className={field}
                value={active.subject.subject_id}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setModuleId("");
                  setTopicId("");
                }}
              >
                {bundles?.map((b) => (
                  <option key={b.subject.subject_id} value={b.subject.subject_id}>
                    {b.subject.subject_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={label}>Class date</label>
              <input
                type="date"
                className={field}
                value={classDate}
                onChange={(e) => setClassDate(e.target.value)}
              />
            </div>

            <div>
              <label className={label}>Module</label>
              <select
                className={field}
                value={moduleId}
                onChange={(e) => {
                  setModuleId(e.target.value);
                  setTopicId("");
                }}
              >
                <option value="">Select a module</option>
                {active.modules.map((m) => (
                  <option key={m.module_id} value={m.module_id}>
                    Module {m.module_number} — {m.module_name || "Untitled"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={label}>Topic taught</label>
              <select
                className={field}
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={!activeModule}
              >
                <option value="">{activeModule ? "Select a topic" : "Choose a module first"}</option>
                {activeModule?.topics.map((t) => (
                  <option key={t.topic_id} value={t.topic_id}>
                    {t.topic_name || "Untitled topic"}
                    {t.completed ? " (completed)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={label}>Classes used</label>
              <input
                type="number"
                min={1}
                className={field}
                value={classesUsed}
                onChange={(e) => setClassesUsed(Number(e.target.value) || 1)}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={markComplete}
                  onChange={(e) => setMarkComplete(e.target.checked)}
                />
                Mark this topic as completed
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className={label}>Notes (optional)</label>
              <textarea
                rows={3}
                maxLength={500}
                className={field}
                placeholder="What was covered, pending doubts, revision needed…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={busy}
            onClick={submit}
            className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60 sm:w-auto"
          >
            {busy ? "SAVING…" : "RECORD CLASS"}
          </button>
        </Panel>

        <Panel className="p-5">
          <h2 className="font-display text-lg font-medium">Recent classes</h2>
          {recent.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No classes recorded yet.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {recent.map((s) => {
                const mod = active.modules.find((m) => m.module_id === s.module_id);
                const top = mod?.topics.find((t) => t.topic_id === s.topic_id);
                return (
                  <li key={s.session_id} className="border-b border-border pb-3 last:border-b-0">
                    <p className="font-medium">{top?.topic_name || mod?.module_name || "Class"}</p>
                    <p className="text-[11px] text-fog">
                      {formatDate(s.class_date)} · {s.classes_used} class
                      {s.classes_used === 1 ? "" : "es"}
                    </p>
                    {s.notes ? (
                      <p className="mt-1 text-xs text-muted-foreground">{s.notes}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
