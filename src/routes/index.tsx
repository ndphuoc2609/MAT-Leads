import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, RefreshCw, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useLeadPipeline } from "@/hooks/use-lead-pipeline";
import { KpiRow } from "@/components/leads/kpi-row";
import { MetaLeadsSection } from "@/components/leads/meta-leads-section";
import { CallCenterSection } from "@/components/leads/call-center-section";
import { ProcessedSection } from "@/components/leads/processed-section";
import { DealerSection } from "@/components/leads/dealer-section";
import { Connector } from "@/components/leads/ui-bits";
import { SUCCESS_OUTCOMES, clockTime, type Lead } from "@/lib/leads-data";
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

const RANGES = [
  { id: "today", label: "Hôm nay" },
  { id: "7d", label: "7 ngày" },
  { id: "30d", label: "30 ngày" },
];

const FILTERS = [
  { id: "all", label: "Tất cả trạng thái" },
  { id: "new", label: "Lead mới" },
  { id: "waiting", label: "Chờ gọi" },
  { id: "calling", label: "Đang gọi" },
  { id: "contacted", label: "Đã liên hệ" },
  { id: "unreachable", label: "Không liên hệ được" },
  { id: "qualified", label: "Đủ điều kiện" },
  { id: "testdrive", label: "Hẹn lái thử" },
];

function Dashboard() {
  const {
    leads,
    loading,
    now,
    updatedAt,
    playing,
    flight,
    setPlaying,
    refresh,
    addLead,
    pushToCallCenter,
    completeLead,
  } = useLeadPipeline();

  const [range, setRange] = useState("today");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const matches = (lead: Lead) => {
    const q = query.trim().toLowerCase();
    const okQuery =
      !q ||
      lead.name.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      (lead.dealer ?? "").toLowerCase().includes(q);
    const okFilter =
      filter === "all" ||
      (filter === "new" && lead.stage === "meta") ||
      (["waiting", "calling"].includes(filter) &&
        lead.stage === "call" &&
        lead.callStatus === filter) ||
      (filter === "contacted" && lead.callStatus === "contacted") ||
      (filter === "unreachable" &&
        (lead.callStatus === "unreachable" || lead.outcome === "unreachable")) ||
      (["qualified", "testdrive"].includes(filter) && lead.outcome === filter);
    return okQuery && okFilter;
  };

  const visible = useMemo(
    () => leads.filter(matches),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leads, query, filter],
  );

  const metaLeads = visible.filter((l) => l.stage === "meta");
  const callLeads = visible.filter((l) => l.stage === "call");
  const processedLeads = visible
    .filter((l) => l.stage === "processed")
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));

  const total = leads.length;
  const called = leads.filter(
    (l) => l.stage === "processed" || (l.stage === "call" && l.callStatus !== "waiting"),
  ).length;
  const successful = leads.filter((l) => l.outcome && SUCCESS_OUTCOMES.includes(l.outcome)).length;
  const assigned = leads.filter((l) => l.dealer).length;
  const searching = query.trim().length > 0 || filter !== "all";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-navy text-navy-foreground">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-5 sm:flex sm:justify-between sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-navy-muted">
              META ADS · HYUNDAI LEADS
            </p>
            <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
              Hyundai Lead Operations
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="flex items-center justify-end gap-1.5 text-xs font-medium">
                <span className="size-1.5 animate-pulse rounded-full bg-success" />
                Đang trực tuyến
              </p>
              <p className="text-[11px] text-navy-muted">
                Cập nhật {updatedAt ? clockTime(updatedAt) : "--:--"}
              </p>
            </div>
            <button
              onClick={refresh}
              title="Làm mới"
              aria-label="Làm mới"
              className="grid size-9 place-items-center rounded-lg bg-navy-foreground/10 transition-colors hover:bg-navy-foreground/20"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex rounded-lg border border-border p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  range === r.id
                    ? "bg-navy text-navy-foreground"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Lọc trạng thái lead"
              className="h-9 appearance-none rounded-lg border border-border bg-surface pr-3 pl-8 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {FILTERS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên, số điện thoại, đại lý"
              className="h-9 w-full rounded-lg border border-border bg-surface pr-3 pl-8 text-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={addLead}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Sparkles className="size-3.5" />
              Mô phỏng lead mới
            </button>
            <button
              onClick={() => setPlaying(!playing)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
            >
              {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              {playing ? "Tạm dừng mô phỏng" : "Chạy mô phỏng"}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <KpiRow
          metaTotal={total}
          called={called}
          successful={successful}
          assigned={assigned}
          loading={loading}
        />

        <div className="space-y-1">
          <MetaLeadsSection
            leads={metaLeads}
            total={total}
            now={now}
            loading={loading}
            searching={searching}
            onPush={pushToCallCenter}
          />

          <FlightConnector
            label="Chuyển sang Call Center"
            active={flight?.kind === "meta-call"}
            text={flight?.label ?? ""}
            flightKey={flight?.key}
          />

          <CallCenterSection
            leads={callLeads}
            called={called}
            total={total}
            loading={loading}
            searching={searching}
            onComplete={completeLead}
          />

          <FlightConnector
            label="Hoàn tất xử lý"
            active={flight?.kind === "call-processed"}
            text={flight?.label ?? ""}
            flightKey={flight?.key}
          />

          <ProcessedSection leads={processedLeads} loading={loading} searching={searching} />

          <FlightConnector
            label="Phân bổ về đại lý"
            active={flight?.kind === "processed-dealer"}
            text={flight?.label ?? ""}
            flightKey={flight?.key}
          />
        </div>

        <DealerSection leads={leads} now={now} loading={loading} />

        <p className="pb-4 text-center text-[11px] text-muted-foreground">
          Dữ liệu demo · {total} leads · mô phỏng luồng Meta Lead Ads → Call Center → Đại lý
        </p>
      </main>
    </div>
  );
}

function FlightConnector({
  label,
  active,
  text,
  flightKey,
}: {
  label: string;
  active?: boolean;
  text: string;
  flightKey?: number;
}) {
  return (
    <div className="relative">
      <Connector label={label} />
      {active ? (
        <span
          key={flightKey}
          className="animate-lead-fly pointer-events-none absolute top-0 left-1/2 z-10 max-w-[70%] truncate rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground shadow-md"
        >
          {text}
        </span>
      ) : null}
    </div>
  );
}
