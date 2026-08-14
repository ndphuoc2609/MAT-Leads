import { useState } from "react";
import { ArrowDownToLine, Facebook } from "lucide-react";
import { SectionCard, EmptyState, RowSkeleton } from "./ui-bits";
import { maskPhone, timeAgo, type Lead } from "@/lib/leads-data";
import { cn } from "@/lib/utils";

export function MetaLeadsSection({
  leads,
  total,
  now,
  loading,
  searching,
  onPush,
}: {
  leads: Lead[];
  total: number;
  now: number;
  loading: boolean;
  searching: boolean;
  onPush: (id: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? leads : leads.slice(0, 6);

  return (
    <SectionCard
      title="Leads mới từ Meta"
      icon={<Facebook className="size-4" />}
      meta="Lead Ads · chưa vào Call Center"
      action={
        <span className="rounded-full bg-navy px-2.5 py-1 text-[11px] font-semibold text-navy-foreground">
          {total} leads
        </span>
      }
    >
      {loading ? (
        <RowSkeleton rows={4} />
      ) : visible.length === 0 ? (
        <EmptyState
          text={searching ? "Không tìm thấy lead phù hợp." : "Chưa có lead mới từ Meta."}
        />
      ) : (
        <ul className="space-y-2">
          {visible.map((lead) => (
            <li
              key={lead.id}
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-accent/60",
                lead.isNew && "animate-lead-enter",
              )}
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-semibold">{lead.name}</span>
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    Mới
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {maskPhone(lead.phone)} · {lead.model} · {lead.campaign}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {timeAgo(lead.receivedAt, now)}
                </span>
                <button
                  onClick={() => onPush(lead.id)}
                  title="Đẩy sang Call Center"
                  className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <ArrowDownToLine className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && leads.length > 6 ? (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-xs font-medium text-primary hover:underline"
        >
          {showAll ? "Thu gọn" : `Xem tất cả (${leads.length})`}
        </button>
      ) : null}
    </SectionCard>
  );
}
