import { useCallback, useEffect, useRef, useState } from "react";
import {
  AGENTS,
  DEALERS,
  SUCCESS_OUTCOMES,
  buildLeads,
  newIncomingLead,
  type Lead,
  type Outcome,
} from "@/lib/leads-data";

export type MoveKind = "meta-call" | "call-processed" | "processed-dealer" | null;

export function useLeadPipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [flight, setFlight] = useState<{ kind: MoveKind; label: string; key: number } | null>(null);
  const seed = useRef(1);

  const load = useCallback(() => {
    setLoading(true);
    const t = window.setTimeout(() => {
      const ts = Date.now();
      setNow(ts);
      setUpdatedAt(ts);
      setLeads(buildLeads(ts));
      setLoading(false);
    }, 700);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => load(), [load]);

  useEffect(() => {
    const i = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(i);
  }, []);

  const fly = (kind: MoveKind, label: string) => {
    setFlight({ kind, label, key: Date.now() });
    window.setTimeout(() => setFlight(null), 700);
  };

  const addLead = useCallback(() => {
    seed.current += 7919;
    const lead = newIncomingLead(Date.now(), seed.current);
    setLeads((prev) => [lead, ...prev]);
    setUpdatedAt(Date.now());
  }, []);

  /** Đẩy lead mới nhất từ Meta xuống Call Center */
  const pushToCallCenter = useCallback((id?: string) => {
    setLeads((prev) => {
      const target = id
        ? prev.find((l) => l.id === id)
        : prev.filter((l) => l.stage === "meta").sort((a, b) => b.receivedAt - a.receivedAt)[0];
      if (!target) return prev;
      fly("meta-call", target.name);
      return prev.map((l) =>
        l.id === target.id
          ? {
              ...l,
              stage: "call" as const,
              callStatus: "calling" as const,
              agent: AGENTS[Math.floor(Math.random() * AGENTS.length)] as string,
              lastCallAt: Date.now(),
              isNew: true,
            }
          : l,
      );
    });
    setUpdatedAt(Date.now());
  }, []);

  const completeLead = useCallback((id: string, outcome: Outcome) => {
    setLeads((prev) => {
      const target = prev.find((l) => l.id === id);
      if (!target || target.stage !== "call") return prev;
      fly("call-processed", target.name);
      const success = SUCCESS_OUTCOMES.includes(outcome);
      const ts = Date.now();
      if (success) {
        window.setTimeout(() => {
          const dealer = DEALERS[Math.floor(Math.random() * 5)] as string;
          setLeads((cur) =>
            cur.map((l) =>
              l.id === id ? { ...l, dealer, assignedAt: Date.now(), isNew: true } : l,
            ),
          );
          fly("processed-dealer", `${target.name} → đại lý`);
        }, 750);
      }
      return prev.map((l) =>
        l.id === id
          ? {
              ...l,
              stage: "processed" as const,
              outcome,
              callStatus: outcome === "unreachable" ? ("unreachable" as const) : ("contacted" as const),
              completedAt: ts,
              lastCallAt: l.lastCallAt ?? ts,
              isNew: true,
            }
          : l,
      );
    });
    setUpdatedAt(Date.now());
  }, []);

  // Autoplay
  useEffect(() => {
    if (!playing || loading) return;
    const i = window.setInterval(() => {
      const roll = Math.random();
      if (roll < 0.35) {
        addLead();
      } else if (roll < 0.7) {
        pushToCallCenter();
      } else {
        setLeads((prev) => {
          const candidate = prev.find((l) => l.stage === "call" && l.callStatus !== "waiting");
          if (candidate) {
            const outcomes: Outcome[] = [
              "qualified",
              "testdrive",
              "qualified",
              "not_interested",
              "unreachable",
            ];
            const o = outcomes[Math.floor(Math.random() * outcomes.length)] as Outcome;
            window.setTimeout(() => completeLead(candidate.id, o), 0);
          }
          return prev;
        });
      }
      setUpdatedAt(Date.now());
    }, 4200);
    return () => window.clearInterval(i);
  }, [playing, loading, addLead, pushToCallCenter, completeLead]);

  return {
    leads,
    loading,
    now,
    updatedAt,
    playing,
    flight,
    setPlaying,
    refresh: load,
    addLead,
    pushToCallCenter,
    completeLead,
  };
}
