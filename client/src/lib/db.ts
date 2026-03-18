/**
 * IndexedDB Database Layer for My Car Rent
 * Uses the `idb` library for a promise-based API over IndexedDB.
 * Stores: entries, plates
 */
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

// ── Types ──────────────────────────────────────────────────────────
export type Category = "wash" | "delivery" | "pickup" | "other";

export interface Entry {
  id: string;
  date: string; // YYYY-MM-DD
  category: Category;
  plate: string; // can be empty for "other" category
  price: number;
  note: string;
  customTitle: string; // used when category is "other"
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface Plate {
  id: string;
  plate: string;
  model: string; // e.g. "Yaris Ativ", "City Turbo"
  color: string; // e.g. "ขาว", "ดำ"
  createdAt: number;
}

// ── DB Schema ──────────────────────────────────────────────────────
interface MyCarRentDB extends DBSchema {
  entries: {
    key: string;
    value: Entry;
    indexes: {
      "by-date": string;
      "by-category": Category;
      "by-plate": string;
      "by-date-category": [string, Category];
    };
  };
  plates: {
    key: string;
    value: Plate;
    indexes: {
      "by-plate": string;
    };
  };
}

// ── Singleton DB ───────────────────────────────────────────────────
let dbPromise: Promise<IDBPDatabase<MyCarRentDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MyCarRentDB>("my-car-rent-db", 2, {
      upgrade(db, oldVersion) {
        // If upgrading from v1, delete old stores
        if (oldVersion < 2) {
          if (db.objectStoreNames.contains("entries")) {
            db.deleteObjectStore("entries");
          }
          if (db.objectStoreNames.contains("plates")) {
            db.deleteObjectStore("plates");
          }
        }

        // Entries store
        const entryStore = db.createObjectStore("entries", { keyPath: "id" });
        entryStore.createIndex("by-date", "date");
        entryStore.createIndex("by-category", "category");
        entryStore.createIndex("by-plate", "plate");
        entryStore.createIndex("by-date-category", ["date", "category"]);

        // Plates store
        const plateStore = db.createObjectStore("plates", { keyPath: "id" });
        plateStore.createIndex("by-plate", "plate", { unique: true });
      },
    });
  }
  return dbPromise;
}

// ── ID Generator ───────────────────────────────────────────────────
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── Entry CRUD ─────────────────────────────────────────────────────
export async function addEntry(
  data: Omit<Entry, "id" | "createdAt" | "updatedAt">
): Promise<Entry> {
  const db = await getDB();
  const now = Date.now();
  const entry: Entry = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  await db.put("entries", entry);
  return entry;
}

export async function updateEntry(
  id: string,
  data: Partial<Omit<Entry, "id" | "createdAt">>
): Promise<Entry | undefined> {
  const db = await getDB();
  const existing = await db.get("entries", id);
  if (!existing) return undefined;
  const updated: Entry = { ...existing, ...data, updatedAt: Date.now() };
  await db.put("entries", updated);
  return updated;
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("entries", id);
}

export async function getEntry(id: string): Promise<Entry | undefined> {
  const db = await getDB();
  return db.get("entries", id);
}

export async function getAllEntries(): Promise<Entry[]> {
  const db = await getDB();
  return db.getAll("entries");
}

export async function getEntriesByDate(date: string): Promise<Entry[]> {
  const db = await getDB();
  return db.getAllFromIndex("entries", "by-date", date);
}

export async function getEntriesByCategory(
  category: Category
): Promise<Entry[]> {
  const db = await getDB();
  return db.getAllFromIndex("entries", "by-category", category);
}

export async function getEntriesByDateRange(
  startDate: string,
  endDate: string
): Promise<Entry[]> {
  const db = await getDB();
  const range = IDBKeyRange.bound(startDate, endDate);
  return db.getAllFromIndex("entries", "by-date", range);
}

// ── Plate CRUD ─────────────────────────────────────────────────────
export async function addPlate(
  plateNumber: string,
  model: string = "",
  color: string = ""
): Promise<Plate> {
  const db = await getDB();
  const plate: Plate = {
    id: generateId(),
    plate: plateNumber.trim(),
    model: model.trim(),
    color: color.trim(),
    createdAt: Date.now(),
  };
  await db.put("plates", plate);
  return plate;
}

export async function updatePlate(
  id: string,
  plateNumber: string,
  model?: string,
  color?: string
): Promise<Plate | undefined> {
  const db = await getDB();
  const existing = await db.get("plates", id);
  if (!existing) return undefined;
  const updated: Plate = {
    ...existing,
    plate: plateNumber.trim(),
    ...(model !== undefined ? { model: model.trim() } : {}),
    ...(color !== undefined ? { color: color.trim() } : {}),
  };
  await db.put("plates", updated);
  return updated;
}

export async function deletePlate(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("plates", id);
}

export async function getAllPlates(): Promise<Plate[]> {
  const db = await getDB();
  return db.getAll("plates");
}

// ── Seed Real Plates ──────────────────────────────────────────────
export async function seedRealPlates(): Promise<void> {
  const db = await getDB();

  // Check if plates already exist
  const existingPlates = await db.count("plates");
  if (existingPlates > 0) return;

  const realPlates: { plate: string; model: string; color: string }[] = [
    { plate: "ขฉ 9452", model: "Yaris Ativ", color: "ขาว" },
    { plate: "ขฉ 7685", model: "Yaris Ativ", color: "ขาว" },
    { plate: "ขฉ 7516", model: "Yaris Ativ", color: "เทา" },
    { plate: "ขท 4090", model: "Yaris Ativ", color: "ขาว" },
    { plate: "ขต 3245", model: "City Turbo", color: "ขาว" },
    { plate: "ขต 9425", model: "City Turbo", color: "ขาว" },
    { plate: "ขต 9542", model: "City Turbo", color: "ขาว" },
    { plate: "ขท 529", model: "City Turbo", color: "ขาว" },
    { plate: "ขท 595", model: "City Turbo", color: "ขาว" },
    { plate: "ขธ 953", model: "City Turbo", color: "ขาว" },
    { plate: "ขต 9452", model: "City eHEV", color: "ขาว" },
    { plate: "ก 2064", model: "City eHEV", color: "ขาว" },
    { plate: "ขง 3753", model: "City Hatchback", color: "" },
    { plate: "ขจ 9894", model: "HRV", color: "ดำ" },
    { plate: "ขธ 54", model: "HRV", color: "ขาว" },
    { plate: "ขธ 945", model: "HRV", color: "ขาว" },
    { plate: "ขธ 996", model: "HRV", color: "ขาว" },
  ];

  for (const p of realPlates) {
    await addPlate(p.plate, p.model, p.color);
  }
}

// ── Seed Sample Data ───────────────────────────────────────────────
export async function seedSampleData(): Promise<void> {
  const db = await getDB();

  // Check if data already exists
  const existingEntries = await db.count("entries");
  if (existingEntries > 0) return;

  // Ensure plates are seeded first
  await seedRealPlates();

  // Get all plates for sample entries
  const allPlates = await getAllPlates();
  const plateNumbers = allPlates.map((p) => p.plate);

  // Generate sample entries for the past 30 days
  const categories: Category[] = ["wash", "delivery", "pickup"];
  const prices: Record<string, number[]> = {
    wash: [200, 250, 300, 350, 400],
    delivery: [500, 600, 700, 800, 1000],
    pickup: [300, 400, 500, 600],
  };
  const notes: Record<string, string[]> = {
    wash: ["ล้างภายนอก", "ล้างทั้งภายในภายนอก", "ล้างแว็กซ์", ""],
    delivery: ["ส่งสนามบิน", "ส่งโรงแรม", "ส่งบ้านลูกค้า", ""],
    pickup: ["เก็บจากสนามบิน", "เก็บจากโรงแรม", "เก็บจากอู่", ""],
  };

  const today = new Date();
  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split("T")[0];

    // 2-5 entries per day
    const numEntries = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numEntries; i++) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const plate =
        plateNumbers[Math.floor(Math.random() * plateNumbers.length)];
      const price =
        prices[cat][Math.floor(Math.random() * prices[cat].length)];
      const note =
        notes[cat][Math.floor(Math.random() * notes[cat].length)];

      await addEntry({
        date: dateStr,
        category: cat,
        plate,
        price,
        note,
        customTitle: "",
      });
    }

    // Occasionally add an "other" entry
    if (Math.random() < 0.3) {
      const otherTitles = ["ค่าน้ำมัน", "ค่าทางด่วน", "ค่าที่จอดรถ", "ค่าซ่อมบำรุง", "ค่าประกัน"];
      const otherPrices = [100, 150, 200, 500, 1000, 1500];
      await addEntry({
        date: dateStr,
        category: "other",
        plate: "",
        price: otherPrices[Math.floor(Math.random() * otherPrices.length)],
        note: "",
        customTitle: otherTitles[Math.floor(Math.random() * otherTitles.length)],
      });
    }
  }
}
