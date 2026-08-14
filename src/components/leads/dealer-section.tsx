import { Building2 } from "lucide-react";
import { RowSkeleton, EmptyState } from "./ui-bits";
import { timeAgo, type Lead } from "@/lib/leads-data";

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
    <section className="card-surface p-4 sm:p-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold tracking-tight">
              Đại lý vừa nhận lead
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              5 đại lý có lần nhận lead gần nhất
            </p>
          </div>
        </div>
      </header>

      <div className="mt-4">
        {loading ? (
          <RowSkeleton rows={3} />
        ) : groups.length === 0 ? (
          <EmptyState text="Chưa có lead nào được phân bổ về đại lý." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <article
                key={group.dealer}
                className="animate-lead-enter rounded-xl border border-border p-3.5"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{group.dealer}</h3>
                    <p className="text-xs text-muted-foreground">
                      Nhận gần nhất {timeAgo(group.lastAt, now)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success-foreground">
                    +{group.leads.length}
                  </span>
                </div>

                <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                  {group.leads.slice(0, 3).map((lead) => (
                    <li
                      key={lead.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{lead.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {lead.model} · {timeAgo(lead.assignedAt as number, now)}
                        </p>
                      </div>
                      <button className="shrink-0 text-[11px] font-medium text-primary hover:underline">
                        Xem lead
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
