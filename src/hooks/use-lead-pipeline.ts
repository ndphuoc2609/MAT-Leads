import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchDashboardPipeline,
  type DashboardPipeline,
  type PipelineItem,
} from "@/lib/dashboard-api";
import type { Lead } from "@/lib/leads-data";

export type MoveKind = "meta-call" | "call-processed" | "processed-dealer" | null;
type Column = "meta" | "call_center" | "processed";
type Snapshot = Record<Column, PipelineItem[]>;

function toLead(item: PipelineItem, isNew = false): Lead {
  const processedAt = item.processed_at ? Date.parse(item.processed_at) : undefined;
  const lead: Lead = {
    id: item.id,
    name: item.name,
    phone: item.phone,
    model: item.model,
    campaign: "",
    receivedAt: item.created_at ? Date.parse(item.created_at) : Date.now(),
    stage: "processed",
    isNew,
  };
  if (item.dealer) lead.dealer = item.dealer;
  if (processedAt !== undefined) {
    lead.assignedAt = processedAt;
    lead.completedAt = processedAt;
  }
  return lead;
}

function findColumn(snapshot: Snapshot | null, id: string): Column | null {
  if (!snapshot) return null;
  for (const column of ["meta", "call_center", "processed"] as Column[]) {
    if (snapshot[column].some((item) => item.id === id)) return column;
  }
  return null;
}

function toLeads(snapshot: Snapshot, previous: Snapshot | null): Lead[] {
  const previousIds = new Set(
    Object.values(previous ?? {})
      .flat()
      .map((item) => item.id),
  );
  const map = (items: PipelineItem[], stage: Lead["stage"]) =>
    items.map((item) => ({ ...toLead(item, !previousIds.has(item.id)), stage }));
  return [
    ...map(snapshot.meta, "meta"),
    ...map(snapshot.call_center, "call"),
    ...map(snapshot.processed, "processed"),
  ];
}

export function useLeadPipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [updatedAt, setUpdatedAt] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [flight, setFlight] = useState<{ kind: MoveKind; label: string; key: number } | null>(null);
  const [summary, setSummary] = useState<DashboardPipeline["summary"] | null>(null);
  const previous = useRef<Snapshot | null>(null);

  const load = useCallback(async () => {
    const isInitialLoad = previous.current === null;
    if (isInitialLoad) setLoading(true);
    try {
      const data = await fetchDashboardPipeline();
      const current: Snapshot = {
        meta: data.columns.meta.items,
        call_center: data.columns.call_center.items,
        processed: data.columns.processed.items,
      };
      const moved = Object.values(current)
        .flat()
        .find((item) => {
          const from = findColumn(previous.current, item.id);
          const to = findColumn(current, item.id);
          return from !== null && to !== null && from !== to;
        });
      if (moved) {
        const from = findColumn(previous.current, moved.id);
        const to = findColumn(current, moved.id);
        const kind: MoveKind =
          from === "meta" && to === "call_center"
            ? "meta-call"
            : from === "call_center" && to === "processed"
              ? "call-processed"
              : to === "processed" && moved.dealer
                ? "processed-dealer"
                : null;
        if (kind) {
          setFlight({ kind, label: moved.name, key: Date.now() });
          window.setTimeout(() => setFlight(null), 700);
        }
      }
      setLeads(toLeads(current, previous.current));
      setSummary(data.summary);
      previous.current = current;
      setNow(Date.now());
      setUpdatedAt(Date.now());
      setError(null);
    } catch {
      setError("Không thể tải dữ liệu dashboard");
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 20_000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return {
    leads,
    summary,
    loading,
    error,
    now,
    updatedAt,
    playing,
    flight,
    setPlaying,
    refresh: load,
    pushToCallCenter: () => undefined,
    completeLead: () => undefined,
  };
}
