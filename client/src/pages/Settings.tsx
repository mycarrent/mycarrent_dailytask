/**
 * Settings Page — App info, seed sample data, clear data
 * Design: Orange & White theme
 */
import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { motion } from "framer-motion";
import {
  Database,
  Trash2,
  Smartphone,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663452232695/Geqw5Dwwk2pA5LmRx3Tkji/my-car-rent-logo_efb7efea.webp";

export default function Settings() {
  const { seedData, entries, plates } = useData();
  const [showClear, setShowClear] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Listen for online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSeedData = async () => {
    await seedData();
    toast.success("เพิ่มข้อมูลตัวอย่างสำเร็จ");
  };

  const handleClearData = async () => {
    // Clear IndexedDB
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) indexedDB.deleteDatabase(db.name);
    }
    setShowClear(false);
    toast.success("ล้างข้อมูลสำเร็จ — กรุณารีเฟรชหน้า");
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="page-enter pb-6">
      <h1 className="text-2xl font-bold mb-6">ตั้งค่า</h1>

      {/* App Info */}
      <div className="brutal-card p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={LOGO_URL}
            alt="My Car Rent"
            className="h-14 w-auto"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
            <p className="text-2xl font-bold num-display text-orange-600">{entries.length}</p>
            <p className="text-xs text-muted-foreground">รายการทั้งหมด</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
            <p className="text-2xl font-bold num-display text-orange-600">{plates.length}</p>
            <p className="text-xs text-muted-foreground">ทะเบียนรถ</p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="brutal-card p-4 mb-4">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-orange-500" />
          )}
          <div>
            <p className="font-medium text-sm">
              {isOnline ? "ออนไลน์" : "ออฟไลน์"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isOnline
                ? "เชื่อมต่ออินเทอร์เน็ตแล้ว"
                : "ทำงานแบบออฟไลน์ — ข้อมูลจะถูกบันทึกในเครื่อง"}
            </p>
          </div>
        </div>
      </div>

      {/* PWA Install */}
      <div className="brutal-card p-4 mb-4">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-orange-500" />
          <div>
            <p className="font-medium text-sm">ติดตั้งแอป</p>
            <p className="text-xs text-muted-foreground">
              เปิดในเบราว์เซอร์ แล้วกด "Add to Home Screen" เพื่อติดตั้ง
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSeedData}
          className="brutal-btn w-full bg-card text-left flex items-center gap-3 py-3.5"
        >
          <Database className="w-5 h-5 text-orange-500" />
          <div>
            <p className="font-medium text-sm">เพิ่มข้อมูลตัวอย่าง</p>
            <p className="text-xs text-muted-foreground">
              สร้างข้อมูลทดสอบ 30 วัน
            </p>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowClear(true)}
          className="brutal-btn w-full bg-card text-left flex items-center gap-3 py-3.5"
        >
          <Trash2 className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-medium text-sm text-destructive">ล้างข้อมูลทั้งหมด</p>
            <p className="text-xs text-muted-foreground">
              ลบรายการและทะเบียนรถทั้งหมด
            </p>
          </div>
        </motion.button>
      </div>

      {/* Info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          ข้อมูลทั้งหมดถูกเก็บในเครื่องของคุณ (IndexedDB)
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          ไม่มีข้อมูลถูกส่งไปยังเซิร์ฟเวอร์ภายนอก
        </p>
      </div>

      {/* Clear Data Confirmation */}
      <AlertDialog open={showClear} onOpenChange={setShowClear}>
        <AlertDialogContent className="brutal-card !rounded-xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>ล้างข้อมูลทั้งหมด?</AlertDialogTitle>
            <AlertDialogDescription>
              การดำเนินการนี้จะลบรายการและทะเบียนรถทั้งหมด ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              className="bg-destructive text-destructive-foreground"
            >
              ล้างข้อมูล
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
