import { useState } from "react";
import { Headphones, MoreHorizontal } from "lucide-react";
import { FlowColumn, LeadRow, QueueEmpty, QueueSkeleton } from "./flow-bits";
import { CallStatusBadge } from "./ui-bits";
import { type Lead, type Outcome } from "@/lib/leads-data";

const OUTCOMES: [Outcome, string][] = [
  ["qualified", "Đủ điều kiện"],
  ["testdrive", "Hẹn lái thử"],
  ["not_interested", "Không quan tâm"],
  ["unreachable", "Không liên hệ được"],
];

export function CallCenterSection({
  leads,
  loading,
  onComplete,
}: {
  leads: Lead[];
  loading: boolean;
  onComplete: (id: string, outcome: Outcome) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const visible = leads.slice(0, 5);

  return (
    <FlowColumn title="Call Center" icon={<Headphones className="size-3.5" />} count={leads.length}>
      {loading ? (
        <QueueSkeleton rows={5} />
      ) : visible.length === 0 ? (
        <QueueEmpty text="Không có lead." />
      ) : (
        <>
          <ul className="space-y-1.5">
            {visible.map((lead) => (
              <li key={lead.id} className="relative list-none">
                <LeadRow
                  as="div"
                  name={lead.name}
                  detail={`${lead.model}`}
                  isNew={lead.isNew ?? false}
                  badge={<CallStatusBadge />}
                  // action={
                  //   <button
                  //     onClick={() => setOpenId(openId === lead.id ? null : lead.id)}
                  //     aria-expanded={openId === lead.id}
                  //     aria-label={`Cập nhật kết quả cho ${lead.name}`}
                  //     className="grid size-6 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                  //   >
                  //     <MoreHorizontal className="size-3" />
                  //   </button>
                  // }
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
                        className="block w-full truncate rounded-md px-2 py-1.5 text-left text-[11px] transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </FlowColumn>
  );
}
