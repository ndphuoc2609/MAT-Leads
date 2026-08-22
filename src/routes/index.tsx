import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useLeadPipeline } from "@/hooks/use-lead-pipeline";
import { KpiRow } from "@/components/leads/kpi-row";
import { MetaLeadsSection } from "@/components/leads/meta-leads-section";
import { CallCenterSection } from "@/components/leads/call-center-section";
import { ProcessedSection } from "@/components/leads/processed-section";
import { DealerSection } from "@/components/leads/dealer-section";
import { FlowLink } from "@/components/leads/flow-bits";
import { clockTime } from "@/lib/leads-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hyundai Lead Operations · Bảng điều khiển phân bổ lead" },
      {
        name: "description",
        content:
          "Dashboard theo dõi lead Meta Lead Ads của Hyundai: call center, trạng thái xử lý và phân bổ lead về đại lý theo thời gian thực.",
      },
      { property: "og:title", content: "Hyundai Lead Operations" },
      {
        property: "og:description",
        content: "Theo dõi luồng lead Meta Ads từ khi nhận đến khi phân bổ về đại lý Hyundai.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const {
    leads,
    summary,
    error,
    loading,
    now,
    updatedAt,
    playing,
    flight,
    refresh,
    pushToCallCenter,
    completeLead,
  } = useLeadPipeline();

  const metaLeads = leads.filter((lead) => lead.stage === "meta");
  const callLeads = leads.filter((lead) => lead.stage === "call");
  const processedLeads = leads
    .filter((l) => l.stage === "processed")
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));

  const total = leads.length;
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-navy text-navy-foreground">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-5 sm:flex sm:justify-between sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-navy-muted">
              MATGROUP · HYUNDAI LEADS
            </p>
            <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
              Hyundai Lead Dashboard
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="flex items-center justify-end gap-1.5 text-xs font-medium text-navy-foreground/70">
                <span className="size-1.5 animate-pulse rounded-full bg-success" />
                {playing ? `Cập nhật ${updatedAt ? clockTime(updatedAt) : "--:--"}` : "Đã tạm dừng"}
              </p>
            </div>
            <button
              onClick={() => void refresh()}
              title="Làm mới dữ liệu dashboard"
              aria-label="Làm mới dữ liệu dashboard"
              className="grid size-9 place-items-center rounded-lg bg-navy-foreground/10 transition-colors hover:bg-navy-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-foreground"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-3 px-4 py-4 sm:px-6 lg:px-8">
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            Không thể tải số liệu dashboard
          </p>
        ) : null}
        <KpiRow
          interested={summary?.total_interested ?? 0}
          addedToday={summary?.added_today ?? 0}
          processing={summary?.processing_today ?? 0}
          assignedDealers={summary?.assigned_dealers ?? 0}
          loading={loading}
        />

        <div className="grid items-stretch gap-2 lg:grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)_2.5rem_minmax(0,1fr)]">
          <MetaLeadsSection
            leads={metaLeads}
            now={now}
            loading={loading}
            onPush={pushToCallCenter}
          />

          <FlowLink
            label="Sang Call Center"
            active={flight?.kind === "meta-call"}
            text={flight?.label ?? ""}
            flightKey={flight?.key}
          />

          <CallCenterSection
            leads={callLeads}
            total={total}
            loading={loading}
            onComplete={completeLead}
          />

          <FlowLink
            label="Hoàn tất xử lý"
            active={flight?.kind === "call-processed"}
            text={flight?.label ?? ""}
            flightKey={flight?.key}
          />

          <ProcessedSection leads={processedLeads} loading={loading} />
        </div>

        <div className="relative flex flex-col items-center py-0.5" aria-hidden>
          <span className="h-4 w-px bg-border" />
          <span className="animate-flow-particle-y absolute top-0 left-1/2 size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
          {flight?.kind === "processed-dealer" ? (
            <span
              key={flight.key}
              className="animate-lead-fly pointer-events-none absolute top-0 left-1/2 z-10 max-w-[70%] truncate rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground shadow-md"
            >
              {flight.label}
            </span>
          ) : null}
        </div>

        <DealerSection leads={leads} now={now} loading={loading} />

        <p className="pb-2 text-center text-[11px] text-muted-foreground">
          {total} leads · Meta Lead Ads → Call Center → Đại lý
        </p>
      </main>
    </div>
  );
}
