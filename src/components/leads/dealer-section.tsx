import { Link } from "@tanstack/react-router";
import { Building2, ChevronRight } from "lucide-react";
import { timeAgo, type Lead } from "@/lib/leads-data";
import { cn } from "@/lib/utils";

type DealerGroup = { dealer: string; lastAt: number; leads: Lead[] };

export function DealerSection({
  leads,
  now,
  loading,
}: {
  leads: Lead[];
  now: number;
  loading: boolean;
}) {
  const assigned = leads
    .filter((l) => l.dealer && l.assignedAt)
    .sort((a, b) => (b.assignedAt ?? 0) - (a.assignedAt ?? 0));

  const map = new Map<string, DealerGroup>();
  for (const lead of assigned) {
    const key = lead.dealer as string;
    const group = map.get(key);
    if (group) group.leads.push(lead);
    else map.set(key, { dealer: key, lastAt: lead.assignedAt as number, leads: [lead] });
  }
  const groups = Array.from(map.values())
    .sort((a, b) => b.lastAt - a.lastAt)
    .slice(0, 5);

  return (
    <section className="card-surface p-3">
      <header className="flex min-w-0 items-center gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="size-3.5" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-[13px] font-semibold tracking-tight">
            Top 5 đại lý vừa nhận lead
          </h2>
          <p className="truncate text-[11px] text-muted-foreground">
            Phân bổ tự động sau khi lead đủ điều kiện
          </p>
        </div>
        <Link
          to="/dealers"
          className="ml-auto inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-border px-2.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
        >
          Xem tất cả
          <ChevronRight className="size-3" />
        </Link>
      </header>

      <div className="-mx-1 mt-2.5 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1 lg:grid lg:grid-cols-5 lg:overflow-visible">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[104px] w-[220px] shrink-0 animate-pulse rounded-xl border border-border bg-muted/40 lg:w-auto"
              />
            ))
          : groups.length === 0
            ? [
                <p
                  key="empty"
                  className="rounded-lg border border-dashed border-border px-3 py-5 text-center text-xs text-muted-foreground lg:col-span-5"
                >
                  Chưa có lead nào được phân bổ về đại lý.
                </p>,
              ]
            : groups.map((group) => (
                <Link
                  key={group.dealer}
                  to="/dealers"
                  search={{ dealer: group.dealer }}
                  aria-label={`Xem lead của ${group.dealer}`}
                  className={cn(
                    "animate-lead-enter w-[220px] shrink-0 snap-start rounded-xl border border-border p-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:w-auto",
                  )}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-[13px] font-semibold">{group.dealer}</h3>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {timeAgo(group.lastAt, now)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success-foreground">
                      +{group.leads.length}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 border-t border-border pt-2">
                    {group.leads.slice(0, 3).map((lead) => (
                      <li key={lead.id} className="flex min-w-0 items-center gap-1.5">
                        <span className="size-1 shrink-0 rounded-full bg-primary" />
                        <span className="truncate text-[11px]">{lead.name}</span>
                        <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                          {lead.model}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Link>
              ))}
      </div>
    </section>
  );
}
