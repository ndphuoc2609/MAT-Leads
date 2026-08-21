import { Building2, Headphones, Heart, PhoneCall, type LucideIcon } from "lucide-react";

type SupportingKpi = {
  label: string;
  value: number;
  icon: LucideIcon;
};

export function KpiRow({
  interested,
  addedToday,
  processing,
  called,
  assignedDealers,
  loading,
}: {
  interested: number;
  addedToday: number;
  processing: number;
  called: number;
  assignedDealers: number;
  loading: boolean;
}) {
  const supportingItems: SupportingKpi[] = [
    { label: "Lead đang xử lý", value: processing, icon: Headphones },
    { label: "Lead đã gọi", value: called, icon: PhoneCall },
    { label: "Đại lý được phân bổ", value: assignedDealers, icon: Building2 },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-[1.35fr_repeat(3,minmax(0,1fr))]">
      <section className="col-span-2 grid min-h-[76px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-primary bg-primary px-5 py-3 text-primary-foreground shadow-[0_8px_24px_oklch(0.55_0.17_258/0.2)] lg:col-span-1">
        {loading ? (
          <div className="h-9 w-20 animate-pulse rounded-lg bg-primary-foreground/20" />
        ) : (
          <p className="text-4xl leading-none font-extrabold tracking-tight tabular-nums">
            {interested}
          </p>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight">Tổng lead quan tâm</p>
          <p className="mt-1 text-[11px] font-medium text-primary-foreground/80">
            +{addedToday} hôm nay
          </p>
        </div>
      </section>

      {supportingItems.map((item) => (
        <section
          key={item.label}
          className="card-surface grid min-h-[76px] grid-cols-[auto_minmax(0,1fr)] items-center gap-3 px-3.5 py-3"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <item.icon className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-muted-foreground">{item.label}</p>
            {loading ? (
              <div className="mt-1.5 h-7 w-14 animate-pulse rounded bg-muted" />
            ) : (
              <p className="mt-1 text-2xl leading-none font-bold tracking-tight tabular-nums">
                {item.value}
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
