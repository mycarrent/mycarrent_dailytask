/**
 * DataContext — Global data provider for entries and plates
 * Wraps IndexedDB operations and provides reactive state to all components.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  type Entry,
  type Plate,
  type Category,
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

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [e, p] = await Promise.all([getAllEntries(), getAllPlates()]);
    e.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.createdAt - a.createdAt;
    });
    p.sort((a, b) => a.plate.localeCompare(b.plate));
    setEntries(e);
    setPlates(p);
  }, []);

  useEffect(() => {
    seedRealPlates()
      .then(() => refresh())
      .finally(() => setLoading(false));
  }, [refresh]);

  const addEntry = useCallback(
    async (data: Omit<Entry, "id" | "createdAt" | "updatedAt">) => {
      const entry = await dbAddEntry(data);
      await refresh();
      return entry;
    },
    [refresh]
  );

  const updateEntry = useCallback(
    async (id: string, data: Partial<Omit<Entry, "id" | "createdAt">>) => {
      const entry = await dbUpdateEntry(id, data);
      await refresh();
      return entry;
    },
    [refresh]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      await dbDeleteEntry(id);
      await refresh();
    },
    [refresh]
  );

  const addPlate = useCallback(
    async (plate: string, model?: string, color?: string) => {
      const p = await dbAddPlate(plate, model || "", color || "");
      await refresh();
      return p;
    },
    [refresh]
  );

  const updatePlate = useCallback(
    async (id: string, plate: string, model?: string, color?: string) => {
      const p = await dbUpdatePlate(id, plate, model, color);
      await refresh();
      return p;
    },
    [refresh]
  );

  const deletePlate = useCallback(
    async (id: string) => {
      await dbDeletePlate(id);
      await refresh();
    },
    [refresh]
  );

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
