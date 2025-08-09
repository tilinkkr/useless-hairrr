"use client";

import { create } from "zustand";

export type SlotKey = "front" | "back" | "left" | "right";

export type AppStatus = "idle" | "ready" | "processing" | "results";

type ImageSlot = {
  file: File | null;
  previewUrl: string | null;
};

type AppState = {
  status: AppStatus;
  slots: Record<SlotKey, ImageSlot>;
  result: { count: string; status: string } | null;
  setFile: (key: SlotKey, file: File | null) => void;
  setStatus: (status: AppStatus) => void;
  setResult: (count: string, status: string) => void;
  reset: () => void;
};

const createEmptySlots = (): Record<SlotKey, ImageSlot> => ({
  front: { file: null, previewUrl: null },
  back: { file: null, previewUrl: null },
  left: { file: null, previewUrl: null },
  right: { file: null, previewUrl: null },
});

export const useAppStore = create<AppState>((set, get) => ({
  status: "idle",
  slots: createEmptySlots(),
  result: null,
  setFile: (key, file) => {
    const url = file ? URL.createObjectURL(file) : null;
    const nextSlots = { ...get().slots, [key]: { file, previewUrl: url } };
    const allFilled = Object.values(nextSlots).every((s) => !!s.file);
    set({ slots: nextSlots, status: allFilled ? "ready" : "idle" });
  },
  setStatus: (status) => set({ status }),
  setResult: (count, status) => set({ result: { count, status }, status: "results" }),
  reset: () => set({ status: "idle", slots: createEmptySlots(), result: null }),
}));


