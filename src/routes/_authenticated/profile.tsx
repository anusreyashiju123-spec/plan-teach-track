import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Panel, SectionHeading } from "@/components/acadify/primitives";
import { useAcadifyRefresh, useSyllabus, useTeacher } from "@/hooks/use-acadify";
import { supabase } from "@/integrations/supabase/client";
import { updateTeacher } from "@/lib/syllabus";

const field =
  "w-full rounded-lg bg-input px-3 py-2.5 text-sm ring-1 ring-border placeholder:text-fog focus:ring-ring focus:outline-none";
const label = "mb-1.5 block text-xs font-medium text-muted-foreground";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Teacher Profile — Acadify" },
      {
        name: "description",
        content: "Update your teacher profile details and change your Acadify account password.",
      },
      { property: "og:title", content: "Teacher Profile — Acadify" },
      { property: "og:description", content: "Manage your Acadify teacher account." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const refresh = useAcadifyRefresh();
  const { data: teacher, isLoading } = useTeacher();
  const { data: bundles } = useSyllabus();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (teacher) {
      setName(teacher.name ?? "");
      setDepartment(teacher.department ?? "");
    }
  }, [teacher]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading profile…</p>;

  async function saveProfile() {
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    setSavingProfile(true);
    try {
      await updateTeacher({ name: name.trim(), department: department.trim() });
      refresh();
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("The two passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setConfirm("");
      toast.success("Password changed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change the password.");
    } finally {
      setSavingPassword(false);
    }
  }

  const initials = (teacher?.name || "T")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div>
      <SectionHeading title="Teacher Profile" subtitle="Your Acadify account details." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="p-5">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/15 font-display text-lg font-semibold text-primary ring-1 ring-primary/30">
              {initials}
            </div>
            <div>
              <p className="font-display text-lg font-medium">{teacher?.name || "Teacher"}</p>
              <p className="text-xs text-fog">{teacher?.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {bundles?.length ?? 0} subject{(bundles?.length ?? 0) === 1 ? "" : "s"} in your plan
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className={label}>Full name</label>
              <input
                className={field}
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Department</label>
              <input
                className={field}
                maxLength={120}
                placeholder="e.g. Computer Science"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Email</label>
              <input className={field} value={teacher?.email ?? ""} readOnly disabled />
            </div>
          </div>

          <button
            disabled={savingProfile}
            onClick={saveProfile}
            className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {savingProfile ? "SAVING…" : "SAVE PROFILE"}
          </button>
        </Panel>

        <Panel className="p-5">
          <h2 className="font-display text-lg font-medium">Change password</h2>
          <p className="mt-1 text-xs text-fog">Use at least 6 characters.</p>
          <div className="mt-5 space-y-4">
            <div>
              <label className={label}>New password</label>
              <input
                type="password"
                className={field}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Confirm new password</label>
              <input
                type="password"
                className={field}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>
          <button
            disabled={savingPassword}
            onClick={changePassword}
            className="mt-5 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary ring-1 ring-primary/30 hover:bg-primary/10 disabled:opacity-60"
          >
            {savingPassword ? "UPDATING…" : "UPDATE PASSWORD"}
          </button>
        </Panel>
      </div>
    </div>
  );
}
