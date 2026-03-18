/**
 * History Page — View, filter, edit, delete entries
 * Design: Filterable list with swipe-like actions, neo-brutalist cards
 * Supports "other" category with customTitle display
 */
import { useState, useMemo, useCallback } from "react";
import { useData } from "@/contexts/DataContext";
import {
  CATEGORIES,
  CATEGORY_LIST,
  formatPriceFull,
  formatDate,
  getTodayStr,
  getEntryDisplayLabel,
} from "@/lib/utils-app";
import type { Category, Entry } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Pencil,
  Trash2,
  X,
  Save,
  Droplets,
  Truck,
  KeyRound,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  wash: <Droplets className="w-4 h-4" />,
  delivery: <Truck className="w-4 h-4" />,
  pickup: <KeyRound className="w-4 h-4" />,
  other: <ClipboardList className="w-4 h-4" />,
};

export default function History() {
  const { entries, plates, updateEntry, deleteEntry } = useData();

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const [filterPlate, setFilterPlate] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Edit state
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("wash");
  const [editPlate, setEditPlate] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editCustomTitle, setEditCustomTitle] = useState("");

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...entries];
    if (filterDate) {
      result = result.filter((e) => e.date === filterDate);
    }
    if (filterCategory !== "all") {
      result = result.filter((e) => e.category === filterCategory);
    }
    if (filterPlate !== "all") {
      result = result.filter((e) => e.plate === filterPlate);
    }
    return result;
  }, [entries, filterDate, filterCategory, filterPlate]);

  const totalFiltered = useMemo(
    () => filtered.reduce((s, e) => s + e.price, 0),
    [filtered]
  );

  const uniquePlates = useMemo(
    () => Array.from(new Set(entries.map((e) => e.plate).filter(Boolean))).sort(),
    [entries]
  );

  const openEdit = useCallback((entry: Entry) => {
    setEditEntry(entry);
    setEditDate(entry.date);
    setEditCategory(entry.category);
    setEditPlate(entry.plate);
    setEditPrice(String(entry.price));
    setEditNote(entry.note);
    setEditCustomTitle(entry.customTitle || "");
  }, []);

  const handleUpdate = async () => {
    if (!editEntry) return;
    const isOther = editCategory === "other";
    await updateEntry(editEntry.id, {
      date: editDate,
      category: editCategory,
      plate: isOther ? "" : editPlate,
      price: Number(editPrice),
      note: editNote,
      customTitle: isOther ? editCustomTitle : "",
    });
    setEditEntry(null);
    toast.success("แก้ไขสำเร็จ");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteEntry(deleteId);
    setDeleteId(null);
    toast.success("ลบสำเร็จ");
  };

  const clearFilters = () => {
    setFilterDate("");
    setFilterCategory("all");
    setFilterPlate("all");
  };

  const hasFilters = filterDate || filterCategory !== "all" || filterPlate !== "all";

  return (
    <div className="page-enter pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">ประวัติ</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`brutal-btn flex items-center gap-1.5 text-sm py-2 px-3 ${
            hasFilters ? "bg-foreground text-background" : "bg-card"
          }`}
        >
          <Filter className="w-4 h-4" />
          กรอง
          {hasFilters && (
            <span className="w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
              !
            </span>
          )}
        </motion.button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="brutal-card p-4 mb-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  วันที่
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm bg-card num-display"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  ประเภท
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterCategory("all")}
                    className={`px-3 py-1.5 rounded-lg text-sm border-2 transition-colors ${
                      filterCategory === "all"
                        ? "bg-foreground text-background border-foreground"
                        : "border-border bg-card"
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  {CATEGORY_LIST.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm border-2 flex items-center gap-1 transition-colors`}
                      style={{
                        borderColor:
                          filterCategory === cat
                            ? CATEGORIES[cat].color
                            : undefined,
                        backgroundColor:
                          filterCategory === cat
                            ? CATEGORIES[cat].bgColor
                            : undefined,
                        color:
                          filterCategory === cat
                            ? CATEGORIES[cat].color
                            : undefined,
                      }}
                    >
                      {CATEGORY_ICONS[cat]}
                      {CATEGORIES[cat].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  ทะเบียนรถ
                </label>
                <select
                  value={filterPlate}
                  onChange={(e) => setFilterPlate(e.target.value)}
                  className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm bg-card appearance-none"
                >
                  <option value="all">ทั้งหมด</option>
                  {uniquePlates.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  ล้างตัวกรอง
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm text-muted-foreground">
          {filtered.length} รายการ
        </span>
        <span className="num-display text-sm font-semibold">
          รวม {formatPriceFull(totalFiltered)}
        </span>
      </div>

      {/* Entry List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">ไม่พบรายการ</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => {
            const config = CATEGORIES[entry.category];
            const displayLabel = getEntryDisplayLabel(entry);
            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="brutal-card p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {entry.plate ? (
                        <span className="font-medium text-sm">{entry.plate}</span>
                      ) : null}
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: config.bgColor,
                          color: config.color,
                        }}
                      >
                        {displayLabel}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.date)}
                      {entry.note ? ` · ${entry.note}` : ""}
                    </p>
                  </div>
                  <span className="num-display text-sm font-semibold shrink-0">
                    {formatPriceFull(entry.price)}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(entry)}
                      className="w-8 h-8 rounded-lg border-2 border-border flex items-center justify-center hover:bg-accent transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(entry.id)}
                      className="w-8 h-8 rounded-lg border-2 border-destructive text-destructive flex items-center justify-center hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editEntry} onOpenChange={() => setEditEntry(null)}>
        <DialogContent className="brutal-card !rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle>แก้ไขรายการ</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                วันที่
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm bg-card num-display"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                ประเภท
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {CATEGORY_LIST.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setEditCategory(cat);
                      if (cat === "other") setEditPlate("");
                    }}
                    className={`px-2 py-2 rounded-lg text-xs border-2 text-center transition-colors`}
                    style={{
                      borderColor:
                        editCategory === cat
                          ? CATEGORIES[cat].color
                          : undefined,
                      backgroundColor:
                        editCategory === cat
                          ? CATEGORIES[cat].bgColor
                          : undefined,
                      color:
                        editCategory === cat
                          ? CATEGORIES[cat].color
                          : undefined,
                    }}
                  >
                    {CATEGORIES[cat].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Title for "other" */}
            {editCategory === "other" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  หัวข้อ
                </label>
                <Input
                  value={editCustomTitle}
                  onChange={(e) => setEditCustomTitle(e.target.value)}
                  placeholder="เช่น ค่าน้ำมัน, ค่าทางด่วน..."
                  className="border-2"
                />
              </div>
            )}

            {/* Plate (hidden for "other") */}
            {editCategory !== "other" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  ทะเบียนรถ
                </label>
                <select
                  value={editPlate}
                  onChange={(e) => setEditPlate(e.target.value)}
                  className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm bg-card appearance-none"
                >
                  {Array.from(new Set([...plates.map((p) => p.plate), editPlate].filter(Boolean))).map(
                    (p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                ราคา (บาท)
              </label>
              <Input
                type="number"
                inputMode="numeric"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="num-display text-lg border-2"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                หมายเหตุ
              </label>
              <Input
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="หมายเหตุ..."
                className="border-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEntry(null)}>
              ยกเลิก
            </Button>
            <Button onClick={handleUpdate}>
              <Save className="w-4 h-4 mr-1" />
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="brutal-card !rounded-xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบรายการนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
