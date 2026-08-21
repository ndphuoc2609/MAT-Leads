import { CheckCircle2 } from "lucide-react";
import { FlowColumn, LeadRow, QueueEmpty, QueueSkeleton } from "./flow-bits";
import { ProcessedStatusBadge } from "./ui-bits";
import { clockTime, type Lead } from "@/lib/leads-data";

export function ProcessedSection({ leads, loading }: { leads: Lead[]; loading: boolean }) {
  const visible = leads.slice(0, 5);

  return (
    <FlowColumn
      title="Leads đã xử lý"
      meta="Lead đã hoàn tất xử lý"
      icon={<CheckCircle2 className="size-3.5" />}
      count={leads.length}
      accent="success"
    >
      {loading ? (
        <QueueSkeleton rows={5} />
      ) : visible.length === 0 ? (
        <QueueEmpty text="Chưa có lead hoàn tất." />
      ) : (
        <>
          <ul className="space-y-1.5">
            {visible.map((lead) => (
              <LeadRow
                key={lead.id}
                name={lead.name}
                detail={[
                  lead.model,
                  lead.dealer,
                  lead.completedAt ? clockTime(lead.completedAt) : undefined,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                isNew={lead.isNew ?? false}
                badge={<ProcessedStatusBadge outcome={lead.outcome} />}
              />
            ))}
          </ul>
        </>
      )}
    </FlowColumn>
  );
}
