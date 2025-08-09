"use client";

import React from "react";
import { useAppStore } from "../store";

type SlotKey = "front" | "back" | "left" | "right";

const labels: Record<SlotKey, string> = {
  front: "മുൻ ഭാഗം (Front)",
  back: "പിന്നിൽ (Back)",
  left: "ഇടത് (Left)",
  right: "വലത് (Right)",
};

function UploadSlot({ slot }: { slot: SlotKey }) {
  const { slots, setFile } = useAppStore();
  const data = slots[slot];

  return (
    <label className="group relative flex aspect-square w-full cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-black/40 text-white transition hover:bg-black/50">
      {data.previewUrl ? (
        // preview image
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.previewUrl}
          alt={labels[slot]}
          className="absolute inset-0 h-full w-full rounded-xl object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="opacity-80">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-sm opacity-90">{labels[slot]}</span>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
          setFile(slot, file);
        }}
      />
    </label>
  );
}

export default function Uploader() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6">
      <UploadSlot slot="front" />
      <UploadSlot slot="back" />
      <UploadSlot slot="left" />
      <UploadSlot slot="right" />
    </div>
  );
}


