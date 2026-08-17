import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Download, Pause, Play, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { buildLeads, DEALERS, type Lead } from "@/lib/leads-data";
import { getLeadSnapshot } from "@/lib/lead-snapshot";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dealers")({
  validateSearch: (search: Record<string, unknown>) => ({
    dealer: typeof search.dealer === "string" ? search.dealer : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Lead theo đại lý · Hyundai Lead Operations" },
      {
        name: "description",
        content: "Danh sách lead đã phân bổ theo từng đại lý Hyundai.",
      },
    ],
  }),
  component: DealerLeadsPage,
});

const MOCK_NOW = Date.UTC(2026, 7, 17, 14, 30);

function normalize(value: string) {
  return value.toLocaleLowerCase("vi-VN").trim();
}

function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(timestamp);
}

function recordingMeta(lead: Lead) {
  const number = Number(lead.id.replace(/\D/g, ""));
  const seconds = 62 + (number % 119);
  return {
    duration: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`,
    progress: 28 + (number % 38),
  };
}

function DealerLeadsPage() {
  const { dealer } = Route.useSearch();
  const leads = useMemo(
    () => (getLeadSnapshot() ?? buildLeads(MOCK_NOW)).filter((lead) => lead.dealer),
    [],
  );
  const [selectedDealer, setSelectedDealer] = useState(
    dealer && DEALERS.includes(dealer) ? dealer : (DEALERS[0] as string),
  );
  const [dealerQuery, setDealerQuery] = useState("");
  const [leadQuery, setLeadQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const dealerCounts = useMemo(() => {
    const counts = new Map(DEALERS.map((dealer) => [dealer, 0]));
    for (const lead of leads) {
      if (lead.dealer) counts.set(lead.dealer, (counts.get(lead.dealer) ?? 0) + 1);
    }
    return counts;
  }, [leads]);

  const filteredDealers = DEALERS.filter((dealer) =>
    normalize(dealer).includes(normalize(dealerQuery)),
  );

  const selectedLeads = leads
    .filter((lead) => lead.dealer === selectedDealer)
    .filter((lead) => {
      const query = normalize(leadQuery);
      return [lead.name, lead.phone, lead.model].some((value) => normalize(value).includes(query));
    })
    .sort((a, b) => (b.assignedAt ?? 0) - (a.assignedAt ?? 0));

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-5">
        <header className="mb-4 flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft className="size-3.5" />
            Quay lại
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight">Lead theo đại lý</h1>
            <p className="text-[11px] text-muted-foreground">
              {leads.length} lead đã phân bổ · {DEALERS.length} đại lý
            </p>
          </div>
        </header>

        <div className="grid gap-3 md:grid-cols-[320px_minmax(0,1fr)] lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="card-surface min-w-0 p-3">
            <SearchField
              value={dealerQuery}
              onChange={setDealerQuery}
              placeholder="Lọc đại lý..."
              label="Lọc danh sách đại lý"
            />
            {filteredDealers.length === 0 ? (
              <p className="py-7 text-center text-xs text-muted-foreground">
                Không tìm thấy đại lý.
              </p>
            ) : (
              <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 md:max-h-[calc(100vh-9rem)] md:flex-col md:overflow-y-auto md:pr-1 md:pb-0">
                {filteredDealers.map((dealer) => {
                  const selected = dealer === selectedDealer;
                  return (
                    <button
                      key={dealer}
                      type="button"
                      onClick={() => {
                        setSelectedDealer(dealer);
                        setLeadQuery("");
                      }}
                      className={cn(
                        "flex h-9 min-w-[205px] items-center gap-2 rounded-lg border border-transparent px-2 text-left text-xs transition-colors md:min-w-0 md:w-full",
                        selected
                          ? "border-border bg-primary/10 font-semibold text-primary"
                          : "text-foreground hover:bg-accent",
                      )}
                    >
                      <Building2 className="size-3.5 shrink-0 text-current opacity-70" />
                      <span className="min-w-0 flex-1 truncate">{dealer}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground tabular-nums">
                        {dealerCounts.get(dealer) ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          <section className="card-surface min-w-0 overflow-hidden p-3">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="truncate text-[13px] font-semibold">{selectedDealer}</h2>
                <p className="text-[10px] text-muted-foreground">
                  {dealerCounts.get(selectedDealer) ?? 0} lead · số điện thoại đã được ẩn
                </p>
              </div>
              <div className="w-[190px] max-w-full sm:w-[240px]">
                <SearchField
                  value={leadQuery}
                  onChange={setLeadQuery}
                  placeholder="Tìm lead..."
                  label="Tìm lead theo tên, số điện thoại hoặc mẫu xe"
                />
              </div>
            </header>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[720px] table-fixed border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] font-medium uppercase text-muted-foreground">
                    <th className="w-12 px-0 py-2 font-medium">STT</th>
                    <th className="w-[22%] px-0 py-2 font-medium">Tên khách hàng</th>
                    <th className="w-[13%] px-0 py-2 font-medium">Quan tâm xe</th>
                    <th className="w-[16%] px-0 py-2 font-medium">Số điện thoại</th>
                    <th className="w-[21%] px-0 py-2 font-medium">Ngày xác nhận</th>
                    <th className="px-0 py-2 font-medium">File ghi âm</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLeads.map((lead, index) => (
                    <DealerLeadRow
                      key={lead.id}
                      lead={lead}
                      index={index}
                      playing={playingId === lead.id}
                      onTogglePlay={() => setPlayingId(playingId === lead.id ? null : lead.id)}
                    />
                  ))}
                </tbody>
              </table>
              {selectedLeads.length === 0 ? (
                <div className="border-t border-border py-12 text-center">
                  <Building2 className="mx-auto size-7 text-muted-foreground/50" />
                  <p className="mt-2 text-xs font-medium">
                    {leadQuery ? "Không tìm thấy lead phù hợp." : "Đại lý chưa có lead."}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {leadQuery
                      ? "Thử tìm bằng tên, số điện thoại hoặc mẫu xe khác."
                      : "Lead mới sẽ xuất hiện tại đây sau khi được phân bổ."}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-input bg-surface pr-3 pl-8 text-xs shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </label>
  );
}

function DealerLeadRow({
  lead,
  index,
  playing,
  onTogglePlay,
}: {
  lead: Lead;
  index: number;
  playing: boolean;
  onTogglePlay: () => void;
}) {
  const recording = recordingMeta(lead);

  return (
    <tr className="border-b border-border text-xs transition-colors last:border-b-0 hover:bg-accent/40">
      <td className="py-3 text-muted-foreground tabular-nums">{index + 1}</td>
      <td className="py-3 pr-3">
        <p className="truncate font-medium">{lead.name}</p>
      </td>
      <td className="py-3 pr-3 font-medium">{lead.model}</td>
      <td className="py-3 pr-3 font-medium tabular-nums">******{lead.phone.slice(-3)}</td>
      <td className="py-3 pr-3 text-muted-foreground tabular-nums">
        {formatDateTime(lead.assignedAt ?? lead.completedAt ?? lead.receivedAt)}
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={
              playing ? `Tạm dừng ghi âm của ${lead.name}` : `Phát ghi âm của ${lead.name}`
            }
            className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
          >
            {playing ? <Pause className="size-3" /> : <Play className="size-3 fill-current" />}
          </button>
          <span className="h-1 min-w-12 flex-1 overflow-hidden rounded-full bg-muted">
            <span
              className={cn("block h-full rounded-full bg-primary/55", playing && "animate-pulse")}
              style={{ width: `${recording.progress}%` }}
            />
          </span>
          <span className="w-8 text-right text-[10px] text-muted-foreground tabular-nums">
            {recording.duration}
          </span>
          <button
            type="button"
            aria-label={`Tải file ghi âm của ${lead.name}`}
            title="Tải file ghi âm"
            className="grid size-6 shrink-0 place-items-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Download className="size-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
