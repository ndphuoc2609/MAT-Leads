import type { Lead } from "./leads-data";

let currentLeads: Lead[] | null = null;

export function saveLeadSnapshot(leads: Lead[]) {
  currentLeads = leads;
}

export function getLeadSnapshot() {
  return currentLeads;
}
