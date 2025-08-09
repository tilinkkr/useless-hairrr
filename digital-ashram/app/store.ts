"use client";

import { create } from "zustand";

export type ViewState = "welcome" | "quiz" | "uploader" | "results";

type Prophecy = {
  atmaavu_color: string;
  bhagyathinte_noolu: number;
  next_life_hair: string;
  malayalam_tip: string;
} | null;

type AnalysisDetails = {
  total_hairs: number;
  confidence_score: number;
  analysis_time?: string;
  view_breakdown: Array<{
    view: string;
    hairs: number;
    weight: number;
  }>;
};

type Analysis = {
  count: string | number;
  status: string;
  analysis_type?: string;
  confidence?: number;
  view_contributions?: Array<{
    view: string;
    hairs: number;
    weight: number;
  }>;
  heatmaps?: string[];
  details?: AnalysisDetails;
} | null;

type AppStore = {
  view: ViewState;
  prophecy: Prophecy;
  analysis: Analysis;
  setView: (v: ViewState) => void;
  setProphecy: (p: NonNullable<Prophecy>) => void;
  setAnalysis: (a: NonNullable<Analysis>) => void;
  reset: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
  view: "welcome",
  prophecy: null,
  analysis: null,
  setView: (v) => set({ view: v }),
  setProphecy: (p) => set({ prophecy: p, view: "results" }),
  setAnalysis: (a) => set({ analysis: a, view: "results" }),
  reset: () => set({ view: "welcome", prophecy: null, analysis: null }),
}));


