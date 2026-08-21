export type PipelineItem = {
  id: string;
  name: string;
  phone: string;
  model: string;
  dealer?: string | null;
  created_at?: string | null;
  processed_at?: string | null;
  outcome?: string | null;
  recordings: { label: string; url: string }[];
};

export type DashboardPipeline = {
  synced_at: string;
  summary: {
    total_interested: number;
    added_today: number;
    processing_today: number;
    called_total: number;
    assigned_dealers: number;
  };
  columns: {
    meta: { items: PipelineItem[]; total: number };
    call_center: { items: PipelineItem[]; total: number };
    processed: { items: PipelineItem[]; total: number };
  };
  top_dealers: unknown[];
};

export async function fetchDashboardPipeline(): Promise<DashboardPipeline> {
  const baseUrl = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:8000";
  const response = await fetch(`${baseUrl}/api/dashboard/pipeline`, {
    headers: { "X-API-Key": import.meta.env["VITE_API_KEY"] ?? "change-me-api-key" },
  });
  if (!response.ok) throw new Error(`Dashboard API failed: ${response.status}`);
  return response.json() as Promise<DashboardPipeline>;
}
