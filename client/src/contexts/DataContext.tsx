/**
 * DataContext — Global data provider for entries and plates
 * Wraps IndexedDB operations and provides reactive state to all components.
 *
 * Performance: Instead of re-fetching ALL data from IndexedDB after every
 * mutation, each write operation now applies an optimistic in-memory update
 * to the React state directly.  This eliminates the round-trip to IndexedDB
 * and the full re-sort on every add/edit/delete, making the UI feel instant.
 *
 * `refresh()` is kept for cases where a full reload is genuinely needed
 * (e.g., after seeding sample data or clearing the database).
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  type Entry,
  type Plate,
  getAllEntries,
  getAllPlates,
  addEntry as dbAddEntry,
  updateEntry as dbUpdateEntry,
  deleteEntry as dbDeleteEntry,
  addPlate as dbAddPlate,
  updatePlate as dbUpdatePlate,
  deletePlate as dbDeletePlate,
  seedSampleData,
  seedRealPlates,
} from "@/lib/db";

interface DataContextValue {
  entries: Entry[];
  plates: Plate[];
  loading: boolean;
  addEntry: (data: Omit<Entry, "id" | "createdAt" | "updatedAt">) => Promise<Entry>;
  updateEntry: (id: string, data: Partial<Omit<Entry, "id" | "createdAt">>) => Promise<Entry | undefined>;
  deleteEntry: (id: string) => Promise<void>;
  addPlate: (plate: string, model?: string, color?: string) => Promise<Plate>;
  updatePlate: (id: string, plate: string, model?: string, color?: string) => Promise<Plate | undefined>;
  deletePlate: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  seedData: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

// ── Sorting helpers (kept pure so they can be reused) ──────────────
function sortEntries(list: Entry[]): Entry[] {
  return [...list].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.createdAt - a.createdAt;
  });
}

function sortPlates(list: Plate[]): Plate[] {
  return [...list].sort((a, b) => a.plate.localeCompare(b.plate));
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [loading, setLoading] = useState(true);

  // Full reload from IndexedDB — used only on init and after bulk operations
  const refresh = useCallback(async () => {
    const [e, p] = await Promise.all([getAllEntries(), getAllPlates()]);
    setEntries(sortEntries(e));
    setPlates(sortPlates(p));
  }, []);

  useEffect(() => {
    seedRealPlates()
      .then(() => refresh())
      .finally(() => setLoading(false));
  }, [refresh]);

  // ── Entry mutations — optimistic in-memory updates ─────────────
  const addEntry = useCallback(
    async (data: Omit<Entry, "id" | "createdAt" | "updatedAt">) => {
      const entry = await dbAddEntry(data);
      // Insert the new entry and re-sort in memory — no DB round-trip needed
      setEntries((prev) => sortEntries([...prev, entry]));
      return entry;
    },
    []
  );

  const updateEntry = useCallback(
    async (id: string, data: Partial<Omit<Entry, "id" | "createdAt">>) => {
      const updated = await dbUpdateEntry(id, data);
      if (!updated) return undefined;
      setEntries((prev) =>
        sortEntries(prev.map((e) => (e.id === id ? updated : e)))
      );
      return updated;
    },
    []
  );

  const deleteEntry = useCallback(async (id: string) => {
    await dbDeleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ── Plate mutations — optimistic in-memory updates ─────────────
  const addPlate = useCallback(
    async (plate: string, model?: string, color?: string) => {
      const p = await dbAddPlate(plate, model || "", color || "");
      setPlates((prev) => sortPlates([...prev, p]));
      return p;
    },
    []
  );

  const updatePlate = useCallback(
    async (id: string, plate: string, model?: string, color?: string) => {
      const updated = await dbUpdatePlate(id, plate, model, color);
      if (!updated) return undefined;
      setPlates((prev) =>
        sortPlates(prev.map((p) => (p.id === id ? updated : p)))
      );
      return updated;
    },
    []
  );

  const deletePlate = useCallback(async (id: string) => {
    await dbDeletePlate(id);
    setPlates((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ── Seed — full refresh required after bulk insert ─────────────
  const seedData = useCallback(async () => {
    await seedSampleData();
    await refresh();
  }, [refresh]);

  return (
    <DataContext.Provider
      value={{
        entries,
        plates,
        loading,
        addEntry,
        updateEntry,
        deleteEntry,
        addPlate,
        updatePlate,
        deletePlate,
        refresh,
        seedData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
