/**
 * App-specific utility helpers
 * Design: Orange & White — Neo-Brutalist with color-coded categories
 */
import type { Category, Entry } from "./db";

// ── Category Config ────────────────────────────────────────────────
export const CATEGORIES: Record<
  Category,
  { label: string; labelEn: string; color: string; bgColor: string; borderColor: string; icon: string }
> = {
  wash: {
    label: "ล้างรถ",
    labelEn: "Car Wash",
    color: "#3B82F6",
    bgColor: "#DBEAFE",
    borderColor: "#3B82F6",
    icon: "💧",
  },
  delivery: {
    label: "ส่งรถ",
    labelEn: "Car Delivery",
    color: "#10B981",
    bgColor: "#D1FAE5",
    borderColor: "#10B981",
    icon: "🚗",
  },
  pickup: {
    label: "เก็บรถ",
    labelEn: "Car Pickup",
    color: "#F97316",
    bgColor: "#FFEDD5",
    borderColor: "#F97316",
    icon: "🔑",
  },
  other: {
    label: "อื่นๆ",
    labelEn: "Other",
    color: "#8B5CF6",
    bgColor: "#EDE9FE",
    borderColor: "#8B5CF6",
    icon: "📋",
  },
};

export const CATEGORY_LIST: Category[] = ["wash", "delivery", "pickup", "other"];

// ── Formatting ─────────────────────────────────────────────────────
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("th-TH").format(price);
}

export function formatPriceFull(price: number): string {
  return `฿${formatPrice(price)}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("th-TH", {
    month: "short",
    day: "numeric",
  });
}

export function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// ── Date Ranges ────────────────────────────────────────────────────
export function getWeekRange(refDate?: string): { start: string; end: string } {
  const d = refDate ? new Date(refDate + "T00:00:00") : new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const start = new Date(d);
  start.setDate(diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

export function getMonthRange(refDate?: string): { start: string; end: string } {
  const d = refDate ? new Date(refDate + "T00:00:00") : new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

// ── Aggregation ────────────────────────────────────────────────────
export interface CategorySummary {
  category: Category;
  count: number;
  total: number;
}

export function summarizeByCategory(entries: Entry[]): CategorySummary[] {
  const map: Record<Category, CategorySummary> = {
    wash: { category: "wash", count: 0, total: 0 },
    delivery: { category: "delivery", count: 0, total: 0 },
    pickup: { category: "pickup", count: 0, total: 0 },
    other: { category: "other", count: 0, total: 0 },
  };
  for (const e of entries) {
    map[e.category].count++;
    map[e.category].total += e.price;
  }
  return CATEGORY_LIST.map((c) => map[c]);
}

export function totalIncome(entries: Entry[]): number {
  return entries.reduce((sum, e) => sum + e.price, 0);
}

// ── Display helper for entry label ─────────────────────────────────
export function getEntryDisplayLabel(entry: Entry): string {
  if (entry.category === "other") {
    return entry.customTitle || "อื่นๆ";
  }
  return CATEGORIES[entry.category].label;
}

// ── Export Helpers ──────────────────────────────────────────────────
export function entriesToCSV(entries: Entry[]): string {
  const header = "Date,Category,Category (TH),Plate,Price (THB),Custom Title,Note";
  const rows = entries.map(
    (e) =>
      `${e.date},${e.category},${e.category === "other" ? (e.customTitle || "อื่นๆ") : CATEGORIES[e.category].label},${e.plate},${e.price},"${e.customTitle || ""}","${e.note || ""}"`
  );
  return [header, ...rows].join("\n");
}

export function entriesToText(entries: Entry[], title: string): string {
  const lines: string[] = [];
  lines.push("═".repeat(40));
  lines.push(`  📋 ${title}`);
  lines.push("═".repeat(40));
  lines.push("");

  const summary = summarizeByCategory(entries);
  for (const s of summary) {
    const cat = CATEGORIES[s.category];
    lines.push(`${cat.icon} ${cat.label} (${cat.labelEn})`);
    lines.push(`   จำนวน: ${s.count} รายการ`);
    lines.push(`   รวม: ฿${formatPrice(s.total)}`);
    lines.push("");
  }

  lines.push("─".repeat(40));
  lines.push(`💰 รวมรายจ่ายทั้งหมด: ฿${formatPrice(totalIncome(entries))}`);
  lines.push(`📊 จำนวนรายการ: ${entries.length}`);
  lines.push("─".repeat(40));
  lines.push("");

  lines.push("รายละเอียด:");
  for (const e of entries) {
    const cat = CATEGORIES[e.category];
    const label = e.category === "other" ? (e.customTitle || "อื่นๆ") : cat.label;
    const plateStr = e.plate ? `${e.plate} | ` : "";
    lines.push(
      `  ${cat.icon} ${plateStr}${label} | ฿${formatPrice(e.price)}${e.note ? ` | ${e.note}` : ""}`
    );
  }

  lines.push("");
  lines.push("═".repeat(40));
  lines.push("  My Car Rent — สร้างโดยระบบ");
  lines.push("═".repeat(40));

  return lines.join("\n");
}
