import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CompareState {
  collegeIds: string[];
  addCollege: (id: string) => boolean; // returns true if added, false if already present or full
  removeCollege: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
  setCompareIds: (ids: string[]) => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      collegeIds: [],
      addCollege: (id: string) => {
        const { collegeIds } = get();
        if (collegeIds.includes(id)) return false;
        if (collegeIds.length >= 3) return false;
        set({ collegeIds: [...collegeIds, id] });
        return true;
      },
      removeCollege: (id: string) => {
        set({ collegeIds: get().collegeIds.filter((cid) => cid !== id) });
      },
      clearCompare: () => {
        set({ collegeIds: [] });
      },
      isInCompare: (id: string) => {
        return get().collegeIds.includes(id);
      },
      setCompareIds: (ids: string[]) => {
        set({ collegeIds: ids.slice(0, 3) });
      },
    }),
    {
      name: "campus-compass-compare",
    }
  )
);
