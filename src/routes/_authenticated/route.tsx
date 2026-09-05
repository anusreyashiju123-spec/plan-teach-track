import { createFileRoute, redirect, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useTeacher } from "@/hooks/use-acadify";
import { GlowBackdrop } from "@/components/acadify/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/" });
    }
  },
  component: AuthenticatedLayout,
});

const NAV = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/subjects", icon: "📚", label: "Subjects" },
  { to: "/modules", icon: "📖", label: "Modules" },
  { to: "/topics", icon: "📝", label: "Topics" },
  { to: "/record-class", icon: "🗓", label: "Record Class" },
  { to: "/progress", icon: "📊", label: "Progress" },
  { to: "/reports", icon: "📋", label: "Reports" },
  { to: "/edit-syllabus", icon: "✏️", label: "Edit Syllabus" },
  { to: "/profile", icon: "👤", label: "Profile" },
] as const;

function AuthenticatedLayout() {
  const { data: teacher } = useTeacher();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const initials =
    (teacher?.name || teacher?.email || "T")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "T";

  const nav = (
    <>
      <div className="mb-8 flex items-center gap-2.5 px-1">
        <div className="grid size-8 place-items-center rounded-lg bg-primary/20 font-display font-semibold text-primary ring-1 ring-primary/40">
          A
        </div>
        <span className="font-display font-semibold tracking-tight">ACADIFY</span>
      </div>
      <nav className="flex-1 space-y-0.5 text-sm">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            activeProps={{
              className:
                "flex items-center gap-3 rounded-lg px-3 py-2 bg-primary/12 text-primary ring-1 ring-primary/25 font-medium",
            }}
          >
            <span className="grid size-4 shrink-0 place-items-center text-[13px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-destructive/85 transition-colors hover:bg-destructive/10"
        >
          <span className="grid size-4 shrink-0 place-items-center text-[13px]">🚪</span>
          Logout
        </button>
      </nav>
      <div className="glass-strong mt-4 flex items-center gap-3 rounded-lg p-3">
        <div className="grid size-9 place-items-center rounded-full bg-accent/20 font-display text-sm font-semibold text-accent ring-1 ring-accent/40">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">{teacher?.name || "Teacher"}</p>
          <p className="truncate text-[11px] text-fog">{teacher?.department || "Faculty"}</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <GlowBackdrop />
      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-[248px] shrink-0 flex-col border-r border-border bg-sidebar/50 p-5 backdrop-blur-xl lg:flex">
          {nav}
        </aside>

        {open ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              aria-label="Close menu"
              className="absolute inset-0 bg-black/60"
              onClick={() => setOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 flex w-[260px] flex-col border-r border-border bg-sidebar p-5">
              {nav}
            </aside>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl lg:hidden">
            <button
              onClick={() => setOpen(true)}
              className={cn(
                "grid size-9 place-items-center rounded-lg text-lg ring-1 ring-border",
                "glass",
              )}
              aria-label="Open menu"
            >
              ☰
            </button>
            <span className="font-display font-semibold tracking-tight">ACADIFY</span>
          </div>
          <main className="min-w-0 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
