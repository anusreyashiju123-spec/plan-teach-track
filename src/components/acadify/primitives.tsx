import { cn } from "@/lib/utils";
import { statusLabel, type ScheduleStatus } from "@/lib/acadify";
import type { ReactNode } from "react";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("glass rounded-2xl", className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rise-in rounded-2xl p-4",
        highlight ? "bg-primary/10 ring-1 ring-primary/25" : "glass",
      )}
    >
      <p className={cn("text-[11px]", highlight ? "text-primary/80" : "text-muted-foreground")}>
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-2xl font-semibold",
          highlight && "text-primary",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-fog">{hint}</p> : null}
    </div>
  );
}

export function Bar({
  value,
  tone = "primary",
  thick,
}: {
  value: number;
  tone?: "primary" | "muted" | "accent";
  thick?: boolean;
}) {
  const toneClass =
    tone === "primary" ? "bg-primary" : tone === "accent" ? "bg-accent" : "bg-mist/70";
  return (
    <div
      className={cn(
        "overflow-hidden rounded-full bg-black/30",
        thick ? "h-2.5" : "h-1.5",
      )}
    >
      <div
        className={cn("bar-fill h-full rounded-full", toneClass)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function PaceRow({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: number;
  tone?: "primary" | "muted";
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className={tone === "primary" ? "text-primary" : "text-muted-foreground"}>
          {value}%
        </span>
      </div>
      <Bar value={value} tone={tone} />
    </div>
  );
}

export function StatusBadge({ status }: { status: ScheduleStatus }) {
  const map: Record<ScheduleStatus, string> = {
    ahead: "bg-primary/15 ring-primary/30 text-primary",
    on: "bg-accent/15 ring-accent/30 text-accent",
    behind: "bg-destructive/15 ring-destructive/30 text-destructive",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        map[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {statusLabel[status]}
    </span>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Panel className="p-10 text-center">
      <p className="font-display text-lg font-medium">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Panel>
  );
}

export function GlowBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-32 size-[520px] rounded-full bg-primary/15 blur-[130px]" />
      <div className="absolute top-1/3 -right-24 size-[440px] rounded-full bg-accent/12 blur-[120px]" />
      <div className="absolute -bottom-36 left-1/3 size-[400px] rounded-full bg-destructive/10 blur-[120px]" />
    </div>
  );
}
