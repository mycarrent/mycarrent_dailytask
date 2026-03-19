/**
 * BottomNav — Mobile bottom tab navigation
 * Design: Clean Light Mode — all items same size, balanced layout
 */
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  ClipboardList,
  BarChart3,
  MoreHorizontal,
  Car,
  Settings,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { path: "/", label: "หน้าหลัก", icon: LayoutDashboard },
  { path: "/history", label: "ประวัติ", icon: ClipboardList },
  { path: "/add", label: "เพิ่มรายการ", icon: Plus, isPrimary: true },
  { path: "/reports", label: "รายงาน", icon: BarChart3 },
  { path: "/more", label: "เพิ่มเติม", icon: MoreHorizontal, isMore: true },
];

const MORE_ITEMS = [
  { path: "/vehicles", label: "ทะเบียนรถ", icon: Car },
  { path: "/settings", label: "ตั้งค่า", icon: Settings },
];

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = ["/vehicles", "/settings"].includes(location);

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/5"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More menu popup */}
      {showMore && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          className="fixed bottom-20 right-4 z-50 bg-white rounded-2xl p-1.5 min-w-[160px]"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)" }}
        >
          {MORE_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  setLocation(item.path);
                  setShowMore(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                  active ? "bg-orange-50 text-orange-600 font-medium" : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </motion.div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg safe-bottom" style={{ boxShadow: "0 -1px 12px rgba(0,0,0,0.04)" }}>
        <div className="max-w-lg mx-auto flex items-center justify-around px-1 pt-1.5 pb-1.5">
          {NAV_ITEMS.map((item) => {
            const active = item.isMore ? isMoreActive : location === item.path;
            const Icon = item.icon;

            if (item.isMore) {
              return (
                <motion.button
                  key="more"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMore(!showMore)}
                  className="flex flex-col items-center justify-center py-1.5 flex-1"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      active
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 leading-tight ${
                      active
                        ? "font-medium text-orange-600"
                        : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            }

            if (item.isPrimary) {
              return (
                <Link key={item.path} href={item.path}>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center justify-center py-1.5 flex-1"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        location === item.path
                          ? "bg-orange-500 text-white"
                          : "bg-orange-50 text-orange-500"
                      }`}
                      style={
                        location === item.path
                          ? { boxShadow: "0 2px 8px rgba(234,88,12,0.3)" }
                          : undefined
                      }
                    >
                      <Icon className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <span
                      className={`text-[10px] mt-0.5 leading-tight ${
                        location === item.path
                          ? "font-medium text-orange-600"
                          : "text-orange-500"
                      }`}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              );
            }

            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-1.5 flex-1"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      active
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 leading-tight ${
                      active
                        ? "font-medium text-orange-600"
                        : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
