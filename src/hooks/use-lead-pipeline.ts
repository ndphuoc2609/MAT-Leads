import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEALERS,
  SUCCESS_OUTCOMES,
  buildLeads,
  newIncomingLead,
  type Lead,
  type Outcome,
} from "@/lib/leads-data";
import { saveLeadSnapshot } from "@/lib/lead-snapshot";

export type MoveKind = "meta-call" | "call-processed" | "processed-dealer" | null;

export function useLeadPipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [flight, setFlight] = useState<{ kind: MoveKind; label: string; key: number } | null>(null);
  const seed = useRef(1);
  const dealerCursor = useRef(12);

  const load = useCallback(() => {
    setLoading(true);
    const timer = window.setTimeout(() => {
      const timestamp = Date.now();
      setNow(timestamp);
      setUpdatedAt(timestamp);
      setLeads(buildLeads(timestamp));
      setLoading(false);
    }, 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => load(), [load]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading) saveLeadSnapshot(leads);
  }, [leads, loading]);

  const fly = (kind: MoveKind, label: string) => {
    setFlight({ kind, label, key: Date.now() });
    window.setTimeout(() => setFlight(null), 700);
  };

  const addLead = useCallback(() => {
    seed.current += 7919;
    const lead = newIncomingLead(Date.now(), seed.current);
    setLeads((previous) => [lead, ...previous]);
    setUpdatedAt(Date.now());
  }, []);

  const pushToCallCenter = useCallback((id?: string) => {
    setLeads((previous) => {
      const target = id
        ? previous.find((lead) => lead.id === id)
        : previous
            .filter((lead) => lead.stage === "meta")
            .sort((a, b) => b.receivedAt - a.receivedAt)[0];
      if (!target) return previous;
      fly("meta-call", target.name);
      return previous.map((lead) =>
        lead.id === target.id
          ? {
              ...lead,
              stage: "call" as const,
              lastCallAt: Date.now(),
              isNew: true,
            }
          : lead,
      );
    });
    setUpdatedAt(Date.now());
  }, []);

  const completeLead = useCallback((id: string, outcome: Outcome) => {
    setLeads((previous) => {
      const target = previous.find((lead) => lead.id === id);
      if (!target || target.stage !== "call") return previous;

      fly("call-processed", target.name);
      const timestamp = Date.now();
      if (SUCCESS_OUTCOMES.includes(outcome)) {
        window.setTimeout(() => {
          const dealer = DEALERS[dealerCursor.current % DEALERS.length] as string;
          dealerCursor.current += 1;
          setLeads((current) =>
            current.map((lead) =>
              lead.id === id ? { ...lead, dealer, assignedAt: Date.now(), isNew: true } : lead,
            ),
          );
          fly("processed-dealer", `${target.name} → đại lý`);
        }, 750);
      }

      return previous.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              stage: "processed" as const,
              outcome,
              completedAt: timestamp,
              lastCallAt: lead.lastCallAt ?? timestamp,
              isNew: true,
            }
          : lead,
      );
    });
    setUpdatedAt(Date.now());
  }, []);

  useEffect(() => {
    if (!playing || loading) return;
    const timer = window.setInterval(() => {
      const roll = Math.random();
      if (roll < 0.35) {
        addLead();
      } else if (roll < 0.7) {
        pushToCallCenter();
      } else {
        setLeads((previous) => {
          const candidate = previous.find((lead) => lead.stage === "call");
          if (candidate) {
            const outcomes: Outcome[] = [
              "qualified",
              "testdrive",
              "qualified",
              "not_interested",
              "unreachable",
            ];
            const outcome = outcomes[Math.floor(Math.random() * outcomes.length)] as Outcome;
            window.setTimeout(() => completeLead(candidate.id, outcome), 0);
          }
          return previous;
        });
      }
      setUpdatedAt(Date.now());
    }, 4200);
    return () => window.clearInterval(timer);
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
