import { Building2, CheckCircle2, PhoneCall, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Kpi = { label: string; value: number; delta: string; icon: LucideIcon };

export function KpiRow({
  metaTotal,
  called,
  successful,
  assigned,
  loading,
}: {
  metaTotal: number;
  called: number;
  successful: number;
  assigned: number;
  loading: boolean;
}) {
  const items: Kpi[] = [
    { label: "Leads từ Meta", value: metaTotal, delta: "+8", icon: Users },
    { label: "Cuộc gọi đã gọi", value: called, delta: "+6", icon: PhoneCall },
    { label: "Cuộc gọi thành công", value: successful, delta: "+4", icon: CheckCircle2 },
    { label: "Đại lý đã nhận lead", value: assigned, delta: "+2", icon: Building2 },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="card-surface grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 px-3 py-2.5"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <item.icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-muted-foreground">{item.label}</p>
            {loading ? (
              <div className="mt-1 h-5 w-12 animate-pulse rounded bg-muted" />
            ) : (
              <p className="flex items-baseline gap-1.5 text-xl leading-tight font-bold tabular-nums">
                {item.value}
                <span className="text-[11px] font-medium text-success-foreground">
                  {item.delta}
                </span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
