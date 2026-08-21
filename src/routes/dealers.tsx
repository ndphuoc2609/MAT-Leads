import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RecordingPlayer } from "@/components/leads/recording-player";
import {
  fetchCustomerDealers,
  fetchCustomerLeads,
  type CustomerDealer,
  type CustomerLead,
} from "@/lib/customer-processing-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dealers")({
  validateSearch: (search: Record<string, unknown>) => ({
    dealer: typeof search["dealer"] === "string" ? search["dealer"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Lead theo đại lý · Hyundai Lead Operations" },
      { name: "description", content: "Danh sách lead đã phân bổ theo từng đại lý Hyundai." },
    ],
  }),
  component: DealerLeadsPage,
});

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function DealerLeadsPage() {
  const { dealer: urlDealer } = Route.useSearch();
  const navigate = useNavigate({ from: "/dealers" });
  const [dealers, setDealers] = useState<CustomerDealer[]>([]);
  const [selectedDealer, setSelectedDealer] = useState(urlDealer ?? "");
  const [dealerQuery, setDealerQuery] = useState("");
  const [leadQuery, setLeadQuery] = useState("");
  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingDealers, setLoadingDealers] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const loadDealers = useCallback(async () => {
    setLoadingDealers(true);
    setError(null);
    try {
      const data = await fetchCustomerDealers();
      setDealers(data);
      const preferred =
        urlDealer && data.some((item) => item.dealer === urlDealer)
          ? urlDealer
          : (data[0]?.dealer ?? "");
      setSelectedDealer(preferred);
      if (preferred !== urlDealer)
        await navigate({ search: { dealer: preferred || undefined }, replace: true });
    } catch {
      setError("Không thể tải danh sách đại lý. Vui lòng thử lại.");
    } finally {
      setLoadingDealers(false);
    }
  }, [navigate, urlDealer]);
  useEffect(() => {
    void loadDealers();
  }, [loadDealers]);
  useEffect(() => {
    if (urlDealer && dealers.some((item) => item.dealer === urlDealer))
      setSelectedDealer(urlDealer);
  }, [dealers, urlDealer]);

  useEffect(() => {
    if (!selectedDealer) return;
    const timer = window.setTimeout(
      async () => {
        setLoadingLeads(true);
        setError(null);
        try {
          const result = await fetchCustomerLeads({
            dealer: selectedDealer,
            search: leadQuery,
            page,
          });
          setLeads(result.items);
          setTotal(result.total);
        } catch {
          setError("Không thể tải danh sách lead. Vui lòng thử lại.");
        } finally {
          setLoadingLeads(false);
        }
      },
      leadQuery ? 300 : 0,
    );
    return () => window.clearTimeout(timer);
  }, [leadQuery, page, selectedDealer, retryKey]);

  const filteredDealers = useMemo(
    () =>
      dealers.filter((item) =>
        item.dealer
          .toLocaleLowerCase("vi-VN")
          .includes(dealerQuery.toLocaleLowerCase("vi-VN").trim()),
      ),
    [dealerQuery, dealers],
  );
  const pageCount = Math.max(1, Math.ceil(total / 20));
  const selectDealer = async (dealer: string) => {
    setSelectedDealer(dealer);
    setLeadQuery("");
    setPage(1);
    await navigate({ search: { dealer }, replace: true });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-5">
        <header className="mb-4 flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-medium shadow-sm hover:bg-accent"
          >
            <ArrowLeft className="size-3.5" />
            Quay lại
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight">Lead theo đại lý</h1>
            <p className="text-[11px] text-muted-foreground">
              {total} lead đã phân bổ · {dealers.length} đại lý
            </p>
          </div>
        </header>
        {error ? (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setRetryKey((key) => key + 1)}
              className="rounded border border-destructive/30 px-2 py-1 font-medium hover:bg-destructive/10"
            >
              Thử lại
            </button>
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-[320px_minmax(0,1fr)] lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="card-surface min-w-0 p-3">
            <SearchField
              value={dealerQuery}
              onChange={setDealerQuery}
              placeholder="Lọc đại lý..."
              label="Lọc danh sách đại lý"
            />
            {loadingDealers ? (
              <div className="mt-2 space-y-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-9 animate-pulse rounded-lg bg-muted/50" />
                ))}
              </div>
            ) : filteredDealers.length === 0 ? (
              <p className="py-7 text-center text-xs text-muted-foreground">
                Không tìm thấy đại lý.
              </p>
            ) : (
              <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 md:max-h-[calc(100vh-9rem)] md:flex-col md:overflow-y-auto md:pr-1 md:pb-0">
                {filteredDealers.map((item) => (
                  <button
                    key={item.dealer}
                    type="button"
                    onClick={() => void selectDealer(item.dealer)}
                    className={cn(
                      "flex h-9 min-w-[205px] items-center gap-2 rounded-lg border border-transparent px-2 text-left text-xs transition-colors md:min-w-0 md:w-full",
                      item.dealer === selectedDealer
                        ? "border-border bg-primary/10 font-semibold text-primary"
                        : "hover:bg-accent",
                    )}
                  >
                    <Building2 className="size-3.5 shrink-0 opacity-70" />
                    <span className="min-w-0 flex-1 truncate">{item.dealer}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground tabular-nums">
                      {item.lead_count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </aside>
          <section className="card-surface min-w-0 overflow-hidden p-3">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="truncate text-[13px] font-semibold">
                  {selectedDealer || "Chưa chọn đại lý"}
                </h2>
                <p className="text-[10px] text-muted-foreground">
                  {total} lead · số điện thoại đã được ẩn
                </p>
              </div>
              <div className="w-[190px] max-w-full sm:w-[240px]">
                <SearchField
                  value={leadQuery}
                  onChange={(value) => {
                    setLeadQuery(value);
                    setPage(1);
                  }}
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
                  {loadingLeads ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                        Đang tải danh sách lead...
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead, index) => (
                      <DealerLeadRow
                        key={lead.customer_id}
                        lead={lead}
                        index={(page - 1) * 20 + index}
                      />
                    ))
                  )}
                </tbody>
              </table>
              {!loadingLeads && leads.length === 0 ? (
                <div className="border-t border-border py-12 text-center">
                  <Building2 className="mx-auto size-7 text-muted-foreground/50" />
                  <p className="mt-2 text-xs font-medium">
                    {leadQuery ? "Không tìm thấy lead phù hợp." : "Đại lý chưa có lead."}
                  </p>
                </div>
              ) : null}
            </div>
            <footer className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-[10px] text-muted-foreground">
                Trang {page} / {pageCount}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1 || loadingLeads}
                  onClick={() => setPage((value) => value - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[10px] disabled:opacity-40"
                >
                  <ChevronLeft className="size-3" />
                  Trang trước
                </button>
                <button
                  type="button"
                  disabled={page >= pageCount || loadingLeads}
                  onClick={() => setPage((value) => value + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[10px] disabled:opacity-40"
                >
                  Trang sau
                  <ChevronRight className="size-3" />
                </button>
              </div>
            </footer>
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
function DealerLeadRow({ lead, index }: { lead: CustomerLead; index: number }) {
  return (
    <tr className="border-b border-border text-xs transition-colors last:border-b-0 hover:bg-accent/40">
      <td className="py-3 text-muted-foreground tabular-nums">{index + 1}</td>
      <td className="py-3 pr-3">
        <p className="truncate font-medium">{lead.full_name || "—"}</p>
      </td>
      <td className="py-3 pr-3 font-medium">{lead.car_interest || "—"}</td>
      <td className="py-3 pr-3 font-medium tabular-nums">{lead.phone}</td>
      <td className="py-3 pr-3 text-muted-foreground tabular-nums">
        {formatDate(lead.confirmed_at)}
      </td>
      <td className="py-3">
        <RecordingPlayer recordings={lead.recordings} />
      </td>
    </tr>
  );
}
