/**
 * Dashboard Page — Today's summary with category breakdown and recent activity
 * Design: Orange & White — Neo-Brutalist cards with orange accent
 */
import { useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import {
  CATEGORIES,
  CATEGORY_LIST,
  formatPriceFull,
  getTodayStr,
  summarizeByCategory,
  totalIncome,
  formatDate,
  getEntryDisplayLabel,
} from "@/lib/utils-app";
import type { Category } from "@/lib/db";
import { motion } from "framer-motion";
import { Droplets, Truck, KeyRound, ClipboardList, TrendingUp, CalendarDays } from "lucide-react";
import DailyChart from "@/components/DailyChart";

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  wash: <Droplets className="w-6 h-6" />,
  delivery: <Truck className="w-6 h-6" />,
  pickup: <KeyRound className="w-6 h-6" />,
  other: <ClipboardList className="w-6 h-6" />,
};

export default function Dashboard() {
  const { entries } = useData();
  const today = getTodayStr();

  const todayEntries = useMemo(
    () => entries.filter((e) => e.date === today),
    [entries, today]
  );

  const todaySummary = useMemo(
    () => summarizeByCategory(todayEntries),
    [todayEntries]
  );

  const todayTotal = useMemo(() => totalIncome(todayEntries), [todayEntries]);

  const bestCategory = useMemo(() => {
    const best = todaySummary.reduce(
      (max, s) => (s.total > max.total ? s : max),
      todaySummary[0]
    );
    return best?.total > 0 ? best : null;
  }, [todaySummary]);

  // Recent entries (last 10)
  const recentEntries = useMemo(() => entries.slice(0, 10), [entries]);

  // Last 7 days data for chart
  const last7Days = useMemo(() => {
    const days: { date: string; total: number; wash: number; delivery: number; pickup: number; other: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayEntries = entries.filter((e) => e.date === dateStr);
      days.push({
        date: dateStr,
        total: totalIncome(dayEntries),
        wash: dayEntries.filter((e) => e.category === "wash").reduce((s, e) => s + e.price, 0),
        delivery: dayEntries.filter((e) => e.category === "delivery").reduce((s, e) => s + e.price, 0),
        pickup: dayEntries.filter((e) => e.category === "pickup").reduce((s, e) => s + e.price, 0),
        other: dayEntries.filter((e) => e.category === "other").reduce((s, e) => s + e.price, 0),
      });
    }
    return days;
  }, [entries]);

  return (
    <div className="page-enter pb-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{formatDate(today)}</span>
        </div>
        <h1 className="text-2xl font-bold">สรุปวันนี้</h1>
      </div>

      {/* Total Expense Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="brutal-card p-5 mb-5 text-white"
        style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80 mb-1">รายจ่ายวันนี้</p>
            <p className="text-3xl font-bold num-display">{formatPriceFull(todayTotal)}</p>
            <p className="text-sm opacity-70 mt-1">{todayEntries.length} รายการ</p>
          </div>
          {bestCategory && (
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end opacity-80 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">รายจ่ายสูงสุด</span>
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: CATEGORIES[bestCategory.category].color,
                  color: "white",
                }}
              >
                {CATEGORIES[bestCategory.category].icon}{" "}
                {CATEGORIES[bestCategory.category].label}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Category Cards */}
      <div className="grid grid-cols-4 gap-2 mb-6 stagger-children">
        {CATEGORY_LIST.map((cat) => {
          const s = todaySummary.find((x) => x.category === cat)!;
          const config = CATEGORIES[cat];
          return (
            <motion.div
              key={cat}
              whileTap={{ scale: 0.97 }}
              className="brutal-card p-3 text-center"
              style={{ borderColor: config.color }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-1.5"
                style={{ backgroundColor: config.bgColor, color: config.color }}
              >
                {CATEGORY_ICONS[cat]}
              </div>
              <p className="text-[11px] text-muted-foreground mb-0.5">{config.label}</p>
              <p className="text-base font-bold num-display" style={{ color: config.color }}>
                {s.count}
              </p>
              <p className="text-[10px] num-display text-muted-foreground">
                {formatPriceFull(s.total)}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* 7-Day Chart */}
      <div className="brutal-card p-4 mb-6">
        <h2 className="text-base font-semibold mb-3">รายจ่าย 7 วันล่าสุด</h2>
        <DailyChart data={last7Days} />
      </div>

      {/* Recent Activity */}
      <div className="brutal-card p-4">
        <h2 className="text-base font-semibold mb-3">กิจกรรมล่าสุด</h2>
        {recentEntries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">ยังไม่มีรายการ</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentEntries.map((entry) => {
              const config = CATEGORIES[entry.category];
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-lg"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {entry.plate && (
                        <span className="font-medium text-sm truncate">{entry.plate}</span>
                      )}
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: config.bgColor,
                          color: config.color,
                        }}
                      >
                        {getEntryDisplayLabel(entry)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.date === today ? "วันนี้" : entry.date}
                      {entry.note ? ` · ${entry.note}` : ""}
                    </p>
                  </div>
                  <span className="num-display text-sm font-semibold shrink-0">
                    {formatPriceFull(entry.price)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
