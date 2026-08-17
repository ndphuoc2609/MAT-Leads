import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SUCCESS_OUTCOMES, type Outcome } from "@/lib/leads-data";

export function SectionCard({
  title,
  icon,
  meta,
  action,
  children,
  className,
}: {
  title: string;
  icon?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card-surface p-4 sm:p-5", className)}>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          {icon ? (
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold tracking-tight">{title}</h2>
            {meta ? <p className="truncate text-xs text-muted-foreground">{meta}</p> : null}
          </div>
        </div>
        {action}
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const badgeBase =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap";

export function CallStatusBadge() {
  return <span className={cn(badgeBase, "bg-primary/10 text-primary")}>Đang xử lý</span>;
}

export function ProcessedStatusBadge({ outcome }: { outcome: Outcome | undefined }) {
  const interested = outcome ? SUCCESS_OUTCOMES.includes(outcome) : true;

  return (
    <span
      className={cn(
        badgeBase,
        interested
          ? "bg-success-soft text-success-foreground"
          : "bg-warning-soft text-warning-foreground",
      )}
    >
      {interested ? "Quan tâm" : "Không quan tâm"}
    </span>
  );
}

export function RowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
          <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

export function Connector({ label }: { label: string }) {
  return (
    <div className="relative flex flex-col items-center py-1" aria-hidden>
      <span className="h-5 w-px bg-border" />
      <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] text-muted-foreground">
        {label}
      </span>
      <span className="h-5 w-px bg-border" />
      <span className="-mt-1 size-1.5 rotate-45 border-r border-b border-border" />
    </div>
  );
}
