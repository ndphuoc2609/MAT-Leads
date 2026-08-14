import { CheckCircle2 } from "lucide-react";
import { FlowColumn, LeadRow, MoreRow, QueueEmpty, QueueSkeleton } from "./flow-bits";
import { OutcomeBadge } from "./ui-bits";
import { clockTime, type Lead } from "@/lib/leads-data";

export function ProcessedSection({
  leads,
  loading,
  searching,
}: {
  leads: Lead[];
  loading: boolean;
  searching: boolean;
}) {
  const visible = leads.slice(0, 5);

  return (
    <FlowColumn
      title="Leads đã xử lý"
      meta="Kết quả sau khi liên hệ"
      icon={<CheckCircle2 className="size-3.5" />}
      count={leads.length}
      accent="success"
      live
    >
      {loading ? (
        <QueueSkeleton rows={5} />
      ) : visible.length === 0 ? (
        <QueueEmpty text={searching ? "Không tìm thấy lead phù hợp." : "Chưa có lead hoàn tất."} />
      ) : (
        <>
          <ul className="space-y-1.5">
            {visible.map((lead) => (
              <LeadRow
                key={lead.id}
                name={lead.name}
                detail={`${lead.model} · ${lead.dealer ?? `NV: ${lead.agent ?? "—"}`}${
                  lead.completedAt ? ` · ${clockTime(lead.completedAt)}` : ""
                }`}
                isNew={lead.isNew ?? false}
                {...(lead.outcome ? { badge: <OutcomeBadge outcome={lead.outcome} /> } : {})}
              />
            ))}
          </ul>
          {leads.length > 5 ? <MoreRow count={leads.length - 5} /> : null}
        </>
      )}
    </FlowColumn>
  );
}
