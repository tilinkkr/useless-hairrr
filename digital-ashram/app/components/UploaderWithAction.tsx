"use client";

import React from "react";
import { useAppStore } from "../store";
import { motion } from "framer-motion";

type SlotKey = "front" | "back" | "left" | "right";

const labels: Record<SlotKey, string> = {
  front: "മുൻ ഭാഗം (Front)",
  back: "പിന്നിൽ (Back)",
  left: "ഇടത് (Left)",
  right: "വലത് (Right)",
};

function UploadSlot({ slot, onFileChange }: { slot: SlotKey; onFileChange: (slot: SlotKey, file: File | null) => void }) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    onFileChange(slot, selectedFile);
    
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <motion.label 
      className="group relative flex aspect-square w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-ashram-accent bg-ashram-background bg-opacity-50 text-ashram-text-primary transition-all duration-300 hover:border-ashram-saffron hover:bg-ashram-background hover:bg-opacity-70"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {previewUrl ? (
        <div className="relative w-full h-full">
          <img
            src={previewUrl}
            alt={labels[slot]}
            className="absolute inset-0 h-full w-full rounded-xl object-cover"
          />
          <div className="absolute inset-0 bg-ashram-background bg-opacity-20 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-ashram-text-primary font-semibold bg-ashram-background bg-opacity-50 px-3 py-1 rounded-full malayalam-text">
              {labels[slot]}
            </span>
          </div>
        </div>
      ) : (
        <motion.div 
          className="flex flex-col items-center gap-3 text-center"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            animate={{ rotate: isHovered ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-ashram-saffron">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.div>
          <span className="text-sm text-ashram-text-secondary font-medium malayalam-text">{labels[slot]}</span>
          <span className="text-xs text-ashram-text-secondary malayalam-text">ക്ലിക്ക് ചെയ്യൂ</span>
        </motion.div>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </motion.label>
  );
}

export default function UploaderWithAction() {
  const { setAnalysis, setView } = useAppStore();
  const [files, setFiles] = React.useState<{ [k: string]: File | null }>({
    front: null,
    back: null,
    left: null,
    right: null,
  });
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingMessage, setProcessingMessage] = React.useState("");

  const handleFileChange = (slot: SlotKey, file: File | null) => {
    setFiles(prev => ({ ...prev, [slot]: file }));
  };

  const allFilled = Object.values(files).every(Boolean);

  const processingMessages = [
    "ആത്മാവിനെ സ്കാൻ ചെയ്യുന്നു... 🧘‍♂️",
    "മുടി എണ്ണം കണക്കാക്കുന്നു... 🔢",
    "ഗുരുവിന്റെ ഉപദേശം കാത്തിരിക്കുന്നു... 🧙‍♂️",
    "ഭാവി പരിശോധിക്കുന്നു... 🔮",
    "ബാൾഡ് ഡിറ്റക്ഷൻ ചെയ്യുന്നു... 😂",
    "ഹീറ്റ്മാപ്പ് ജനറേറ്റ് ചെയ്യുന്നു... 📊",
    "ഫലം തയ്യാറാക്കുന്നു... ⚡"
  ];

  async function onProcess() {
    if (!allFilled) return;
    
    setIsProcessing(true);
    setProcessingMessage("ആരംഭിക്കുന്നു...");
    
    // Cycle through processing messages
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      setProcessingMessage(processingMessages[messageIndex % processingMessages.length]);
      messageIndex++;
    }, 2000);
    
    try {
      const form = new FormData();
      form.append("front", files.front!);
      form.append("back", files.back!);
      form.append("left", files.left!);
      form.append("right", files.right!);
      
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await res.json();
      
      clearInterval(messageInterval);

      // Coerce count to a finite number
      const toNumber = (value: unknown): number => {
        if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
        if (typeof value === 'string') {
          const n = Number(value.replace(/[^\d.-]/g, ''));
          return Number.isFinite(n) ? n : 0;
        }
        return 0;
      };

      const numericCount = toNumber(data.count);
      
      const analysisData = {
        count: numericCount,
        status: data.status || (res.ok ? "Analysis Complete" : "Error"),
        analysis_type: data.analysis_type || "basic",
        confidence: data.confidence ?? 0,
        view_contributions: data.view_contributions ?? [],
        heatmaps: data.heatmaps ?? [],
        details: data.details
      };
      
      setAnalysis(analysisData);
      setView("results");
    } catch (error) {
      console.error("Analysis failed:", error);
      clearInterval(messageInterval);
      setAnalysis({ 
        count: 0, 
        status: "Analysis Failed",
        analysis_type: "error"
      });
      setView("results");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <UploadSlot slot="front" onFileChange={handleFileChange} />
        <UploadSlot slot="back" onFileChange={handleFileChange} />
        <UploadSlot slot="left" onFileChange={handleFileChange} />
        <UploadSlot slot="right" onFileChange={handleFileChange} />
      </div>
      
      {isProcessing ? (
        <motion.div 
          className="text-center p-6 bg-ashram-background bg-opacity-50 rounded-2xl border border-ashram-accent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-ashram-accent border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-lg font-semibold text-ashram-accent mb-2 malayalam-text">
            വിശകലനം ചെയ്യുന്നു...
          </p>
          <p className="text-sm text-ashram-text-secondary malayalam-text">
            {processingMessage}
          </p>
        </motion.div>
      ) : (
        <motion.button
          onClick={onProcess}
          disabled={!allFilled}
          className={`w-full rounded-full px-8 py-4 text-lg font-semibold transition-all duration-300 transform ${
            allFilled 
              ? "bg-ashram-accent hover:bg-opacity-80 text-ashram-background shadow-2xl hover:scale-105" 
              : "bg-ashram-background bg-opacity-50 text-ashram-text-secondary cursor-not-allowed border border-ashram-accent"
          }`}
          whileHover={allFilled ? { scale: 1.05 } : {}}
          whileTap={allFilled ? { scale: 0.95 } : {}}
        >
          {allFilled ? "എൻ്റെ ഭാവി പറയൂ 🔮" : "എല്ലാ ഫോട്ടോകളും അപ്‌ലോഡ് ചെയ്യൂ 📸"}
        </motion.button>
      )}
      
      {!allFilled && (
        <motion.p 
          className="text-center text-ashram-text-secondary text-sm malayalam-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          എല്ലാ 4 ഫോട്ടോകളും അപ്‌ലോഡ് ചെയ്യണം! 📱
        </motion.p>
      )}
    </div>
  );
}


