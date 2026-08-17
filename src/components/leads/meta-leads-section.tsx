import { ArrowRight, Facebook } from "lucide-react";
import { FlowColumn, LeadRow, MoreRow, QueueEmpty, QueueSkeleton } from "./flow-bits";
import { timeAgo, type Lead } from "@/lib/leads-data";

export function MetaLeadsSection({
  leads,
  now,
  loading,
  onPush,
}: {
  leads: Lead[];
  now: number;
  loading: boolean;
  onPush: (id: string) => void;
}) {
  const visible = leads.slice(0, 5);

  return (
    <FlowColumn
      title="Leads mới từ Meta"
      meta="Lead Ads · chờ vào Call Center"
      icon={<Facebook className="size-3.5" />}
      count={leads.length}
      accent="navy"
    >
      {loading ? (
        <QueueSkeleton rows={5} />
      ) : visible.length === 0 ? (
        <QueueEmpty text="Chưa có lead mới." />
      ) : (
        <>
          <ul className="space-y-1.5">
            {visible.map((lead) => (
              <LeadRow
                key={lead.id}
                name={lead.name}
                detail={`${lead.model} · ${timeAgo(lead.receivedAt, now)}`}
                isNew={lead.isNew ?? false}
                badge={
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    Mới
                  </span>
                }
                // action={
                //   <button
                //     onClick={() => onPush(lead.id)}
                //     title="Đẩy sang Call Center"
                //     aria-label={`Đẩy ${lead.name} sang Call Center`}
                //     className="grid size-6 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                //   >
                //     <ArrowRight className="size-3" />
                //   </button>
                // }
              />
            ))}
          </ul>
          {leads.length > 5 ? <MoreRow count={leads.length - 5} /> : null}
        </>
      )}
    </FlowColumn>
  );
}
