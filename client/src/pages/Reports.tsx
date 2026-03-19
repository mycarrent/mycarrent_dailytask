/**
 * Reports Page — Summary & Reports with daily/weekly/monthly views
 * Design: Category breakdown cards, grand total, period switching
 * Changed: "รายได้" → "รายจ่าย", added "other" category
 */
import { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import {
  CATEGORIES,
  CATEGORY_LIST,
  formatPriceFull,
  formatDate,
  formatDateShort,
  getTodayStr,
  getWeekRange,
  getMonthRange,
  summarizeByCategory,
  totalIncome,
  entriesToCSV,
  entriesToText,
} from "@/lib/utils-app";
import type { Category } from "@/lib/db";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CalendarRange,
  Calendar,
  Download,
  Copy,
  Share2,
  FileSpreadsheet,
  TrendingUp,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import DailyChart from "@/components/DailyChart";

type Period = "daily" | "weekly" | "monthly";

export default function Reports() {
  const { entries } = useData();
  const [period, setPeriod] = useState<Period>("daily");
  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  const dateRange = useMemo(() => {
    switch (period) {
      case "daily":
        return { start: selectedDate, end: selectedDate };
      case "weekly":
        return getWeekRange(selectedDate);
      case "monthly":
        return getMonthRange(selectedDate);
    }
  }, [period, selectedDate]);

  const filteredEntries = useMemo(
    () =>
      entries.filter(
        (e) => e.date >= dateRange.start && e.date <= dateRange.end
      ),
    [entries, dateRange]
  );

  const summary = useMemo(
    () => summarizeByCategory(filteredEntries),
    [filteredEntries]
  );

  const total = useMemo(() => totalIncome(filteredEntries), [filteredEntries]);

  const bestCategory = useMemo(() => {
    const best = summary.reduce(
      (max, s) => (s.total > max.total ? s : max),
      summary[0]
    );
    return best?.total > 0 ? best : null;
  }, [summary]);

  // Chart data for the period
  const chartData = useMemo(() => {
    const days: { date: string; total: number; wash: number; delivery: number; pickup: number; other: number }[] = [];
    const start = new Date(dateRange.start + "T00:00:00");
    const end = new Date(dateRange.end + "T00:00:00");
    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      const dayEntries = filteredEntries.filter((e) => e.date === dateStr);
      days.push({
        date: dateStr,
        total: totalIncome(dayEntries),
        wash: dayEntries.filter((e) => e.category === "wash").reduce((s, e) => s + e.price, 0),
        delivery: dayEntries.filter((e) => e.category === "delivery").reduce((s, e) => s + e.price, 0),
        pickup: dayEntries.filter((e) => e.category === "pickup").reduce((s, e) => s + e.price, 0),
        other: dayEntries.filter((e) => e.category === "other").reduce((s, e) => s + e.price, 0),
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [filteredEntries, dateRange]);

  const periodLabel = useMemo(() => {
    switch (period) {
      case "daily":
        return formatDate(selectedDate);
      case "weekly":
        return `${formatDateShort(dateRange.start)} - ${formatDateShort(dateRange.end)}`;
      case "monthly":
        return new Date(selectedDate + "T00:00:00").toLocaleDateString("th-TH", {
          month: "long",
          year: "numeric",
        });
    }
  }, [period, selectedDate, dateRange]);

  // Export functions
  const handleCopyText = () => {
    const text = entriesToText(filteredEntries, periodLabel);
    navigator.clipboard.writeText(text);
    toast.success("คัดลอกข้อความแล้ว");
  };

  const handleExportCSV = () => {
    const csv = entriesToCSV(filteredEntries);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-car-rent-report-${dateRange.start}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ดาวน์โหลด CSV แล้ว");
  };

  const handleShare = async () => {
    const text = entriesToText(filteredEntries, periodLabel);
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err: unknown) {
        // User cancelled share — ignore
        if (err instanceof Error && err.name !== "AbortError") {
          toast.error("ไม่สามารถแชร์ได้");
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      toast.success("คัดลอกข้อความแล้ว (เบราว์เซอร์ไม่รองรับการแชร์)");
    }
  };

  return (
    <div className="page-enter pb-6">
      <h1 className="text-2xl font-bold mb-4">รายงาน</h1>

      {/* Period Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "daily" as Period, label: "รายวัน", icon: CalendarDays },
          { key: "weekly" as Period, label: "รายสัปดาห์", icon: CalendarRange },
          { key: "monthly" as Period, label: "รายเดือน", icon: Calendar },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`flex-1 brutal-btn text-sm py-2.5 flex items-center justify-center gap-1.5 ${
              period === key
                ? "bg-orange-500 text-white border-orange-600"
                : "bg-card"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Date Selector */}
      <div className="mb-5">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full border-2 border-border rounded-xl px-4 py-2.5 text-sm bg-card num-display"
        />
        <p className="text-xs text-muted-foreground mt-1 px-1">{periodLabel}</p>
      </div>

      {/* Export Card (for image capture) */}
      <div>
        {/* Grand Total */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="brutal-card p-5 mb-4 text-white"
          style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)" }}
        >
          <p className="text-sm opacity-80 mb-1">รวมรายจ่ายทั้งหมด</p>
          <p className="text-3xl font-bold num-display">{formatPriceFull(total)}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm opacity-70">
              {filteredEntries.length} รายการ
            </span>
            {bestCategory && (
              <span className="flex items-center gap-1 text-sm">
                <Award className="w-4 h-4" style={{ color: CATEGORIES[bestCategory.category].color }} />
                <span style={{ color: CATEGORIES[bestCategory.category].color }}>
                  {CATEGORIES[bestCategory.category].label}
                </span>
              </span>
            )}
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <div className="space-y-3 mb-5 stagger-children">
          {summary.map((s) => {
            const config = CATEGORIES[s.category];
            const pct = total > 0 ? Math.round((s.total / total) * 100) : 0;
            return (
              <motion.div
                key={s.category}
                whileTap={{ scale: 0.98 }}
                className="brutal-card p-4"
                style={{ borderColor: config.color }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{config.label}</span>
                      <span className="num-display font-bold">
                        {formatPriceFull(s.total)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                      </div>
                      <span className="text-xs num-display text-muted-foreground w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.count} รายการ
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="brutal-card p-4 mb-5">
          <h2 className="text-sm font-semibold mb-3">กราฟรายจ่าย</h2>
          <DailyChart data={chartData} />
        </div>
      )}

      {/* Export Buttons */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Download className="w-4 h-4" />
          ส่งออกรายงาน
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyText}
            className="brutal-btn bg-card text-sm py-3 flex flex-col items-center gap-1.5"
          >
            <Copy className="w-5 h-5" />
            <span>คัดลอก</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="brutal-btn bg-card text-sm py-3 flex flex-col items-center gap-1.5"
          >
            <Share2 className="w-5 h-5" />
            <span>แชร์</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCSV}
            className="brutal-btn bg-card text-sm py-3 flex flex-col items-center gap-1.5"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>CSV</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
