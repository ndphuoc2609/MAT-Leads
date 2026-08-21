import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function FlowColumn({
  title,
  meta,
  icon,
  count,
  accent = "primary",
  toolbar,
  children,
}: {
  title: string;
  meta?: string;
  icon: ReactNode;
  count: number;
  accent?: "navy" | "primary" | "success";
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  const badge =
    accent === "navy"
      ? "bg-navy text-navy-foreground"
      : accent === "success"
        ? "bg-success-soft text-success-foreground"
        : "bg-primary/10 text-primary";

  return (
    <section className="card-surface flex min-w-0 flex-col p-3">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <h2 className="truncate text-[13px] font-semibold tracking-tight">{title}</h2>
          </div>
          {meta ? <p className="truncate text-[11px] text-muted-foreground">{meta}</p> : null}
        </div>
        {/* <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
            badge,
          )}
        >
          {count}
        </span> */}
      </header>
      {toolbar ? <div className="mt-2">{toolbar}</div> : null}
      <div className="mt-2 min-h-0 flex-1">{children}</div>
    </section>
  );
}

export function LeadRow({
  as = "li",
  name,
  detail,
  badge,
  action,
  isNew,
}: {
  as?: "li" | "div";
  name: string;
  detail: string;
  badge?: ReactNode;
  action?: ReactNode;
  isNew?: boolean;
}) {
  const Component = as;
  return (
    <Component
      className={cn(
        "group grid h-[52px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-border px-2.5 transition-colors hover:bg-accent/60",
        isNew && "animate-lead-enter",
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-[13px] leading-tight font-semibold">{name}</p>
        <p className="truncate text-[11px] leading-tight text-muted-foreground">{detail}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {badge}
        {action ? (
          <span className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            {action}
          </span>
        ) : null}
      </div>
    </Component>
  );
}

export function QueueSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="space-y-1.5">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="h-[52px] animate-pulse rounded-lg border border-border bg-muted/50"
        />
      ))}
    </ul>
  );
}

export function QueueEmpty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
      {text}
    </div>
  );
}

/** Connector giữa 2 cột: ngang trên desktop, dọc trên mobile. */
export function FlowLink({
  label,
  active,
  text,
  flightKey,
}: {
  label: string;
  active?: boolean;
  text?: string;
  flightKey?: number | undefined;
}) {
  return (
    <div
      className="relative flex items-center justify-center py-1 lg:h-full lg:w-10 lg:py-0"
      aria-hidden
    >
      {/* mobile: vertical */}
      <div className="relative flex flex-col items-center lg:hidden">
        <span className="h-4 w-px bg-border" />
        <span className="animate-flow-particle-y absolute top-0 left-1/2 size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
        <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] text-muted-foreground">
          {label}
        </span>
      </div>

      {/* desktop: horizontal */}
      <div className="relative hidden w-full items-center lg:flex">
        <span className="h-px w-full bg-border" />
        <span className="absolute top-1/2 left-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface text-muted-foreground">
          <ChevronRight className="size-3" />
        </span>
        <span
          className="animate-flow-particle absolute top-1/2 left-0 size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]"
          style={{ ["--flow-distance" as string]: "2.5rem" }}
        />
        {active ? (
          <span
            key={flightKey}
            className="animate-lead-fly-x pointer-events-none absolute top-1/2 left-0 z-10 max-w-[9rem] truncate rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground shadow-md"
          >
            {text}
          </span>
        ) : null}
      </div>
    </div>
  );
}
