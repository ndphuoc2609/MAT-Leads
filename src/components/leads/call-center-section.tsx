import { useState } from "react";
import { Headphones, MoreHorizontal } from "lucide-react";
import { FlowColumn, LeadRow, MoreRow, QueueEmpty, QueueSkeleton } from "./flow-bits";
import { CallStatusBadge } from "./ui-bits";
import { CALL_STATUS_LABEL, type CallStatus, type Lead, type Outcome } from "@/lib/leads-data";
import { cn } from "@/lib/utils";

const TABS: (CallStatus | "all")[] = ["all", "waiting", "calling", "contacted", "unreachable"];

const OUTCOMES: [Outcome, string][] = [
  ["qualified", "Đủ điều kiện"],
  ["testdrive", "Hẹn lái thử"],
  ["not_interested", "Không quan tâm"],
  ["unreachable", "Không liên hệ được"],
];

export function CallCenterSection({
  leads,
  called,
  total,
  loading,
  searching,
  onComplete,
}: {
  leads: Lead[];
  called: number;
  total: number;
  loading: boolean;
  searching: boolean;
  onComplete: (id: string, outcome: Outcome) => void;
}) {
  const [tab, setTab] = useState<CallStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const filtered = tab === "all" ? leads : leads.filter((l) => l.callStatus === tab);
  const visible = filtered.slice(0, 5);
  const pct = total ? Math.round((called / total) * 100) : 0;

  return (
    <FlowColumn
      title="Call Center"
      meta={`${called}/${total} lead đã gọi`}
      icon={<Headphones className="size-3.5" />}
      count={leads.length}
      live
      toolbar={
        <div className="space-y-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex gap-0.5 rounded-lg bg-muted p-0.5">
            {TABS.map((t) => {
              const count =
                t === "all" ? leads.length : leads.filter((l) => l.callStatus === t).length;
              const label = t === "all" ? "Tất cả" : CALL_STATUS_LABEL[t];
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  title={label}
                  className={cn(
                    "min-w-0 flex-1 truncate rounded-md px-1.5 py-1 text-[10px] font-medium transition-colors",
                    tab === t
                      ? "bg-surface text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label} {count}
                </button>
              );
            })}
          </div>
        </div>
      }
    >
      {loading ? (
        <QueueSkeleton rows={5} />
      ) : visible.length === 0 ? (
        <QueueEmpty text={searching ? "Không tìm thấy lead phù hợp." : "Không có lead."} />
      ) : (
        <>
          <ul className="space-y-1.5">
            {visible.map((lead) => (
              <div key={lead.id} className="relative">
                <LeadRow
                  name={lead.name}
                  detail={`${lead.model} · NV: ${lead.agent ?? "—"}`}
                  isNew={lead.isNew ?? false}
                  badge={<CallStatusBadge status={lead.callStatus} />}
                  action={
                    <button
                      onClick={() => setOpenId(openId === lead.id ? null : lead.id)}
                      title="Cập nhật kết quả"
                      aria-label="Cập nhật kết quả"
                      className="grid size-6 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <MoreHorizontal className="size-3" />
                    </button>
                  }
                />
                {openId === lead.id ? (
                  <div className="card-surface animate-lead-enter absolute top-[46px] right-0 z-20 w-44 p-1">
                    {OUTCOMES.map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => {
                          setOpenId(null);
                          onComplete(lead.id, value);
                        }}
                        className="block w-full truncate rounded-md px-2 py-1.5 text-left text-[11px] transition-colors hover:bg-accent"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </ul>
          {filtered.length > 5 ? <MoreRow count={filtered.length - 5} /> : null}
        </>
      )}
    </FlowColumn>
  );
}
