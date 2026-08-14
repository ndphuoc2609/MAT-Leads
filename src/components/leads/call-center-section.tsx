import { useState } from "react";
import { Headphones } from "lucide-react";
import { SectionCard, EmptyState, RowSkeleton, CallStatusBadge } from "./ui-bits";
import {
  CALL_STATUS_LABEL,
  clockTime,
  type CallStatus,
  type Lead,
  type Outcome,
} from "@/lib/leads-data";
import { cn } from "@/lib/utils";

const TABS: (CallStatus | "all")[] = ["all", "waiting", "calling", "contacted", "unreachable"];

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
  const filtered = tab === "all" ? leads : leads.filter((l) => l.callStatus === tab);
  const pct = total ? Math.round((called / total) * 100) : 0;

  return (
    <SectionCard
      title="Call Center"
      icon={<Headphones className="size-4" />}
      meta={`${called} / ${total} leads đã gọi`}
      action={
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
          {leads.length} đang xử lý
        </span>
      }
    >
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const count = t === "all" ? leads.length : leads.filter((l) => l.callStatus === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                tab === t
                  ? "border-navy bg-navy text-navy-foreground"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {t === "all" ? "Tất cả" : CALL_STATUS_LABEL[t]} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-3">
        {loading ? (
          <RowSkeleton rows={3} />
        ) : filtered.length === 0 ? (
          <EmptyState
            text={searching ? "Không tìm thấy lead phù hợp." : "Không có lead ở trạng thái này."}
          />
        ) : (
          <ul className="space-y-2">
            {filtered.slice(0, 6).map((lead) => (
              <li
                key={lead.id}
                className={cn(
                  "rounded-lg border border-border px-3 py-2.5",
                  lead.isNew && "animate-lead-enter",
                )}
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{lead.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {lead.model} · NV: {lead.agent ?? "—"}
                      {lead.lastCallAt ? ` · gọi lúc ${clockTime(lead.lastCallAt)}` : ""}
                    </p>
                  </div>
                  <CallStatusBadge status={lead.callStatus} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(
                    [
                      ["qualified", "Đủ điều kiện"],
                      ["testdrive", "Hẹn lái thử"],
                      ["not_interested", "Không quan tâm"],
                      ["unreachable", "Không liên hệ được"],
                    ] as [Outcome, string][]
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => onComplete(lead.id, value)}
                      className="rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}
