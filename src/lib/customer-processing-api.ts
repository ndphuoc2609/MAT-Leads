export type Recording = { label: string; url: string };
export type CustomerLead = {
  customer_id: string;
  full_name: string | null;
  car_interest: string | null;
  callcenter_note: string | null;
  dealer: string;
  phone: string;
  confirmed_at: string | null;
  recordings: Recording[];
};
export type CustomerLeadPage = {
  items: CustomerLead[];
  page: number;
  page_size: number;
  total: number;
};
export type CustomerDealer = { dealer: string; lead_count: number };

const baseUrl = (import.meta.env["VITE_API_BASE_URL"] || "http://localhost:8000").replace(
  /\/$/,
  "",
);

async function request<T>(path: string, params?: URLSearchParams) {
  const url = `${baseUrl}${path}${params ? `?${params.toString()}` : ""}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${getToken() ?? ""}` },
  });
  if (response.status === 401) { clearToken(); window.location.href = "/login"; }
  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as { message?: string };
      detail = body.message ? `: ${body.message}` : "";
    } catch {
      /* generic error */
    }
    throw new Error(`API request failed (${response.status})${detail}`);
  }
  return (await response.json()) as T;
}

export function fetchCustomerDealers() {
  return request<CustomerDealer[]>("/api/customer-processing/dealers");
}

export function fetchCustomerLeads({
  dealer,
  search,
  page,
  pageSize = 20,
}: {
  dealer: string;
  search?: string;
  page: number;
  pageSize?: number;
}) {
  const params = new URLSearchParams({ dealer, page: String(page), page_size: String(pageSize) });
  if (search?.trim()) params.set("search", search.trim());
  return request<CustomerLeadPage>("/api/customer-processing/leads", params);
}
import { clearToken, getToken } from "@/lib/auth";
