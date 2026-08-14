import { CheckCircle2 } from "lucide-react";
import { SectionCard, EmptyState, RowSkeleton, OutcomeBadge } from "./ui-bits";
import { clockTime, type Lead } from "@/lib/leads-data";
import { cn } from "@/lib/utils";

export function ProcessedSection({
  leads,
  loading,
  searching,
}: {
  leads: Lead[];
  loading: boolean;
  searching: boolean;
}) {
  return (
    <SectionCard
      title="Leads đã xử lý"
      icon={<CheckCircle2 className="size-4" />}
      meta="Kết quả sau khi Call Center liên hệ"
      action={
        <span className="rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success-foreground">
          {leads.length} lead
        </span>
      }
    >
      {loading ? (
        <RowSkeleton rows={4} />
      ) : leads.length === 0 ? (
        <EmptyState
          text={searching ? "Không tìm thấy lead phù hợp." : "Chưa có lead nào hoàn tất."}
        />
      ) : (
        <ul className="space-y-2">
          {leads.slice(0, 8).map((lead) => (
            <li
              key={lead.id}
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border px-3 py-2.5",
                lead.isNew && "animate-lead-enter",
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{lead.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {lead.model} · NV: {lead.agent ?? "—"}
                  {lead.completedAt ? ` · xong lúc ${clockTime(lead.completedAt)}` : ""}
                  {lead.dealer ? ` · ${lead.dealer}` : ""}
                </p>
              </div>
              {lead.outcome ? <OutcomeBadge outcome={lead.outcome} /> : null}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
