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
    { label: "Leads từ Meta", value: metaTotal, delta: "+8 hôm nay", icon: Users },
    { label: "Cuộc gọi đã gọi", value: called, delta: "+6 hôm nay", icon: PhoneCall },
    { label: "Cuộc gọi thành công", value: successful, delta: "+4 hôm nay", icon: CheckCircle2 },
    { label: "Đại lý đã nhận lead", value: assigned, delta: "+2 hôm nay", icon: Building2 },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="card-surface p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <p className="truncate text-xs font-medium text-muted-foreground">{item.label}</p>
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="size-3.5" />
            </span>
          </div>
          {loading ? (
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{item.value}</p>
          )}
          <p className="mt-1 text-[11px] text-success-foreground">{item.delta}</p>
        </div>
      ))}
    </div>
  );
}
