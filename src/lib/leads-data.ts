export type Stage = "meta" | "call" | "processed";
export type Outcome = "qualified" | "testdrive" | "not_interested" | "unreachable";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  model: string;
  campaign: string;
  receivedAt: number;
  stage: Stage;
  lastCallAt?: number;
  outcome?: Outcome;
  completedAt?: number;
  dealer?: string;
  assignedAt?: number;
  isNew?: boolean;
};

const OLD_PROVINCES = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Hải Phòng",
  "Đà Nẵng",
  "Cần Thơ",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

export const DEALERS = OLD_PROVINCES.map((province) => `Hyundai ${province}`);

export const MODELS = ["Creta", "Accent", "Tucson", "Santa Fe", "Venue", "Palisade"];

export const CAMPAIGNS = [
  "Creta Ưu Đãi Tháng 8",
  "Tucson Lái Thử Cuối Tuần",
  "Santa Fe Trả Góp 0%",
  "Accent Xe Sẵn Giao Ngay",
  "Venue Khách Hàng Trẻ",
  "Palisade Khách VIP",
];

const FIRST = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Ngô"];
const MID = ["Văn", "Thị", "Minh", "Quốc", "Hữu", "Thanh", "Ngọc", "Gia"];
const LAST = [
  "An",
  "Bình",
  "Cường",
  "Dũng",
  "Giang",
  "Hà",
  "Hải",
  "Hùng",
  "Khanh",
  "Lâm",
  "Mai",
  "Nam",
  "Oanh",
  "Phúc",
  "Quân",
  "Sơn",
  "Trang",
  "Tú",
  "Vy",
  "Yến",
];

// Deterministic PRNG so SSR and client render identical data.
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const pick = <T>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)] as T;

export const SUCCESS_OUTCOMES: Outcome[] = ["qualified", "testdrive"];

// Phân bổ có trọng số để dữ liệu demo có độ chênh rõ, thay vì mỗi đại lý chỉ 1–2 lead.
const DEMO_DEALER_DISTRIBUTION = [
  0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 6, 6, 7, 7, 8, 9, 10, 11,
];

export function maskPhone(phone: string) {
  return phone.slice(0, 4) + " ••• " + phone.slice(-3);
}

/** Dữ liệu nền cùng các lead phân bổ bổ sung để số liệu demo rõ ràng hơn. */
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
    };

    if (i < 10) {
      // mới từ Meta
    } else if (i < 22) {
      lead.stage = "call";
      lead.lastCallAt = receivedAt + 9 * 60_000;
    } else {
      lead.stage = "processed";
      const k = i - 22;
      lead.outcome =
        k < 17 ? "qualified" : k < 31 ? "testdrive" : k < 35 ? "not_interested" : "unreachable";
      lead.lastCallAt = receivedAt + 8 * 60_000;
      lead.completedAt = receivedAt + 18 * 60_000;
      if (k < DEMO_DEALER_DISTRIBUTION.length) {
        const dealerIndex = DEMO_DEALER_DISTRIBUTION[k] as number;
        lead.dealer = DEALERS[dealerIndex] as string;
        lead.assignedAt = lead.completedAt + Math.floor(rng() * 20 + 2) * 60_000;
      }
    }

    leads.push(lead);
  }

  const assignedSeeds = leads.filter((lead) => lead.dealer && lead.assignedAt);
  for (let copy = 1; copy <= 2; copy++) {
    assignedSeeds.forEach((seedLead, index) => {
      const receivedAt = seedLead.receivedAt - (copy * assignedSeeds.length + index) * 5 * 60_000;
      const completedAt = receivedAt + 18 * 60_000;

      leads.push({
        id: `LD-${5000 + copy * 100 + index}`,
        name: `${pick(rng, FIRST)} ${pick(rng, MID)} ${pick(rng, LAST)}`,
        phone: `09${Math.floor(rng() * 90 + 10)}${Math.floor(rng() * 900000 + 100000)}`,
        model: pick(rng, MODELS),
        campaign: pick(rng, CAMPAIGNS),
        receivedAt,
        stage: "processed",
        lastCallAt: receivedAt + 8 * 60_000,
        outcome: seedLead.outcome ?? "qualified",
        completedAt,
        dealer: seedLead.dealer,
        assignedAt: completedAt + Math.floor(rng() * 20 + 2) * 60_000,
      });
    });
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
