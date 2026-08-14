export type Stage = "meta" | "call" | "processed";
export type CallStatus = "waiting" | "calling" | "contacted" | "unreachable";
export type Outcome = "qualified" | "testdrive" | "not_interested" | "unreachable";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  model: string;
  campaign: string;
  receivedAt: number;
  stage: Stage;
  callStatus: CallStatus;
  agent?: string;
  lastCallAt?: number;
  outcome?: Outcome;
  completedAt?: number;
  dealer?: string;
  assignedAt?: number;
  isNew?: boolean;
};

export const DEALERS = [
  "Hyundai Đông Đô",
  "Hyundai Gia Định",
  "Hyundai Long Biên",
  "Hyundai Trường Chinh",
  "Hyundai Bình Dương",
  "Hyundai Ngọc An",
];

export const MODELS = ["Creta", "Accent", "Tucson", "Santa Fe", "Venue", "Palisade"];

export const CAMPAIGNS = [
  "Creta Ưu Đãi Tháng 8",
  "Tucson Lái Thử Cuối Tuần",
  "Santa Fe Trả Góp 0%",
  "Accent Xe Sẵn Giao Ngay",
  "Venue Khách Hàng Trẻ",
  "Palisade Khách VIP",
];

export const AGENTS = [
  "Ngọc Ánh",
  "Minh Tuấn",
  "Thu Hà",
  "Quốc Bảo",
  "Phương Linh",
  "Hữu Nghĩa",
];

const FIRST = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Ngô"];
const MID = ["Văn", "Thị", "Minh", "Quốc", "Hữu", "Thanh", "Ngọc", "Gia"];
const LAST = [
  "An", "Bình", "Cường", "Dũng", "Giang", "Hà", "Hải", "Hùng", "Khanh", "Lâm",
  "Mai", "Nam", "Oanh", "Phúc", "Quân", "Sơn", "Trang", "Tú", "Vy", "Yến",
];

// Deterministic PRNG so SSR and client render identical data.
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const pick = <T,>(rng: () => number, arr: T[]) => arr[Math.floor(rng() * arr.length)];

export const CALL_STATUS_LABEL: Record<CallStatus, string> = {
  waiting: "Chờ gọi",
  calling: "Đang gọi",
  contacted: "Đã liên hệ",
  unreachable: "Không liên hệ được",
};

export const OUTCOME_LABEL: Record<Outcome, string> = {
  qualified: "Đủ điều kiện",
  testdrive: "Hẹn lái thử",
  not_interested: "Không quan tâm",
  unreachable: "Không liên hệ được",
};

export const SUCCESS_OUTCOMES: Outcome[] = ["qualified", "testdrive"];

export function maskPhone(phone: string) {
  return phone.slice(0, 4) + " ••• " + phone.slice(-3);
}

/** 62 leads: 10 mới từ Meta, 12 ở Call Center (8 đã gọi), 40 đã xử lý → 48 cuộc gọi. */
export function buildLeads(now: number): Lead[] {
  const rng = makeRng(20260814);
  const leads: Lead[] = [];

  for (let i = 0; i < 62; i++) {
    const name = `${pick(rng, FIRST)} ${pick(rng, MID)} ${pick(rng, LAST)}`;
    const phone = `09${Math.floor(rng() * 90 + 10)}${Math.floor(rng() * 900000 + 100000)}`;
    const receivedAt = now - Math.floor(rng() * 60 + 3) * 60_000 - i * 7 * 60_000;

    const lead: Lead = {
      id: `LD-${(1200 + i).toString()}`,
      name,
      phone,
      model: pick(rng, MODELS),
      campaign: pick(rng, CAMPAIGNS),
      receivedAt,
      stage: "meta",
      callStatus: "waiting",
    };

    if (i < 10) {
      // mới từ Meta
    } else if (i < 22) {
      lead.stage = "call";
      const k = i - 10;
      lead.callStatus =
        k < 4 ? "waiting" : k < 7 ? "calling" : k < 10 ? "contacted" : "unreachable";
      lead.agent = pick(rng, AGENTS);
      if (lead.callStatus !== "waiting") lead.lastCallAt = receivedAt + 9 * 60_000;
    } else {
      lead.stage = "processed";
      const k = i - 22;
      lead.callStatus = k < 31 ? "contacted" : "unreachable";
      lead.outcome =
        k < 17 ? "qualified" : k < 31 ? "testdrive" : k < 35 ? "not_interested" : "unreachable";
      lead.agent = pick(rng, AGENTS);
      lead.lastCallAt = receivedAt + 8 * 60_000;
      lead.completedAt = receivedAt + 18 * 60_000;
      if (k < 12) {
        lead.dealer = DEALERS[k % 5];
        lead.assignedAt = lead.completedAt + Math.floor(rng() * 20 + 2) * 60_000;
      }
    }

    leads.push(lead);
  }

  return leads.sort((a, b) => b.receivedAt - a.receivedAt);
}

export function newIncomingLead(now: number, seed: number): Lead {
  const rng = makeRng(seed);
  return {
    id: `LD-${9000 + (seed % 900)}`,
    name: `${pick(rng, FIRST)} ${pick(rng, MID)} ${pick(rng, LAST)}`,
    phone: `09${Math.floor(rng() * 90 + 10)}${Math.floor(rng() * 900000 + 100000)}`,
    model: pick(rng, MODELS),
    campaign: pick(rng, CAMPAIGNS),
    receivedAt: now,
    stage: "meta",
    callStatus: "waiting",
    isNew: true,
  };
}

export function timeAgo(ts: number, now: number) {
  const d = Math.max(0, Math.round((now - ts) / 60000));
  if (d < 1) return "vừa xong";
  if (d < 60) return `${d} phút trước`;
  const h = Math.floor(d / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export function clockTime(ts: number) {
  const d = new Date(ts);
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}
