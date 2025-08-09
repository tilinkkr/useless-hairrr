"use client";

import dynamic from "next/dynamic";
import { useAppStore } from "../store";
import { AnimatePresence, motion } from "framer-motion";
import HairCounter from "../components/HairCounter";
import IntroVideo from "../components/IntroVideo";
import UploaderWithAction from "../components/UploaderWithAction";
import { getDivineProphecy, getAnalysisComment, getConfidenceComment } from "../utils/prophecy";
import { t } from "../utils/i18n";
const ProphecyGenerator = dynamic(() => import("../components/ProphecyGenerator"), { ssr: false });

const HairCanvas = dynamic(() => import("../components/HairCanvas"), { ssr: false });

export default function HairAnalysisPage() {
  const { view, setView, setProphecy, reset, prophecy, analysis } = useAppStore();

  const fetchProphecy = async () => {
    try {
      const res = await fetch("/api/prophecy", { method: "POST" });
      const data = await res.json();
      setProphecy(data);
    } catch (error) {
      console.error("Failed to fetch prophecy:", error);
    }
  };

  const formatCount = (value: unknown) => {
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'string') {
      const n = Number(value.replace(/[^\d.-]/g, ''));
      if (Number.isFinite(n)) return n.toLocaleString();
    }
    return '0';
  };

  return (
    <main className="min-h-screen bg-ashram-background text-ashram-text-primary relative overflow-hidden">
      {/* 3D Hair Background */}
      <div className="fixed inset-0 z-0">
        <HairCanvas />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {view === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-2xl mx-auto"
            >
              <motion.h1 
                className="text-6xl font-bold mb-4 text-ashram-saffron malayalam-text text-shadow-high-contrast"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                {t("welcome_title")}
              </motion.h1>
              <motion.p 
                className="text-xl mb-8 text-ashram-text-secondary malayalam-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {t("welcome_subtitle")}
              </motion.p>
              <motion.button
                onClick={() => setView("quiz")}
                className="bg-ashram-accent hover:bg-opacity-80 text-ashram-background px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("welcome_cta")}
              </motion.button>
            </motion.div>
          )}

          {view === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-2xl mx-auto"
            >
              <motion.h2 
                className="text-4xl font-bold mb-6 text-ashram-saffron malayalam-text"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                {t("quiz_title")}
              </motion.h2>
              <motion.p 
                className="text-lg mb-8 text-ashram-text-secondary malayalam-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {t("quiz_desc")}
              </motion.p>
              <motion.button
                onClick={() => setView("uploader")}
                className="bg-ashram-accent hover:bg-opacity-80 text-ashram-background px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("quiz_cta")}
              </motion.button>
            </motion.div>
          )}

          {view === "uploader" && (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto"
            >
              <motion.h2 
                className="text-3xl font-bold mb-6 text-center text-ashram-saffron malayalam-text"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                {t("uploader_title")}
              </motion.h2>
              <motion.p 
                className="text-center mb-8 text-ashram-text-secondary malayalam-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {t("uploader_desc")}
              </motion.p>
              <div className="bg-ashram-background bg-opacity-50 backdrop-blur-sm rounded-2xl border border-ashram-accent p-6">
                <UploaderWithAction />
              </div>
            </motion.div>
          )}

          {view === "results" && (prophecy || analysis) && (
            <motion.div 
              key="results" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              transition={{ duration: 0.4 }} 
              className="max-w-4xl mx-auto"
            >
              <motion.h2 
                className="text-4xl font-bold mb-6 text-center text-ashram-saffron malayalam-text"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                ഫലം 🎯
              </motion.h2>
              
              <div className="grid gap-6">
                {/* Analysis Results */}
                {analysis && (
                  <motion.div 
                    className="bg-ashram-background bg-opacity-50 backdrop-blur-sm rounded-2xl border border-ashram-accent p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-2xl font-semibold mb-4 text-ashram-accent malayalam-text">മുടി വിശകലനം 🔬</h3>
                    
                    <div className="grid gap-4">
                      {/* Analysis Time */}
                      {analysis.details?.analysis_time && (
                        <div className="text-center">
                          <p className="text-ashram-text-secondary text-sm malayalam-text">വിശകലന സമയം (Analysis Time)</p>
                          <p className="text-ashram-accent text-2xl font-mono">{analysis.details.analysis_time}</p>
                          <p className="text-ashram-text-secondary text-xs mt-1">
                            {getAnalysisComment(analysis.details.analysis_time, analysis.details.confidence_score || 0).malayalam}
                          </p>
                        </div>
                      )}
                      
                      {/* Hair Count */}
                      <div className="text-center">
                        <p className="text-ashram-text-secondary text-sm malayalam-text">ഗുരുവിന്റെ കണക്ക് (Guru's Count)</p>
                        <p className="text-ashram-saffron text-6xl font-bold animate-pulse malayalam-text">
                          {formatCount(analysis.count)}
                        </p>
                      </div>
                      
                      {/* Divine Prophecy */}
                      <div className="text-center bg-ashram-background bg-opacity-20 p-4 rounded-md">
                        {(() => {
                          const hairCount = Number(formatCount(analysis.count).replace(/,/g, ''));
                          const prophecy = getDivineProphecy(hairCount);
                          return (
                            <>
                              <p className="text-ashram-saffron text-lg malayalam-text">{prophecy.malayalam}</p>
                              <p className="text-ashram-text-secondary text-xs mt-1">{prophecy.english}</p>
                            </>
                          );
                        })()}
                      </div>
                      
                                             {/* Confidence Score */}
                        {analysis.details?.confidence_score && (
                          <div className="text-center">
                            <p className="text-ashram-text-secondary text-sm malayalam-text">വിശ്വാസ്യത (Confidence)</p>
                            <p className="text-ashram-accent text-xl font-mono">
                              {Math.round((analysis.details.confidence_score || 0) * 100)}%
                            </p>
                            <p className="text-ashram-text-secondary text-xs mt-1">
                              {getConfidenceComment(analysis.details.confidence_score || 0).malayalam}
                            </p>
                          </div>
                        )}

                        {/* Scientific Dashboard */}
                        {(analysis.details as any)?.follicular_alignment_index && (
                          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border border-ashram-accent bg-ashram-background bg-opacity-30">
                              <p className="text-ashram-text-secondary text-sm">Follicular Alignment Index</p>
                              <p className="text-ashram-accent text-2xl font-mono">{(analysis.details as any).follicular_alignment_index}</p>
                            </div>
                            <div className="p-4 rounded-lg border border-ashram-accent bg-ashram-background bg-opacity-30">
                              <p className="text-ashram-text-secondary text-sm">Chromatic Vibrancy Score</p>
                              <p className="text-ashram-accent text-2xl font-mono">{(analysis.details as any).chromatic_vibrancy_score}</p>
                            </div>
                            <div className="p-4 rounded-lg border border-ashram-accent bg-ashram-background bg-opacity-30">
                              <p className="text-ashram-text-secondary text-sm">Keratin Integrity Factor</p>
                              <p className="text-ashram-accent text-2xl font-mono">{(analysis.details as any).keratin_integrity_factor}</p>
                            </div>
                            <div className="p-4 rounded-lg border border-ashram-accent bg-ashram-background bg-opacity-30">
                              <p className="text-ashram-text-secondary text-sm">Mudi Mantra</p>
                              <p className="text-ashram-saffron text-lg">{(analysis.details as any).mudi_mantra}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                {/* Spiritual Prophecy */}
                {prophecy && (
                  <motion.div 
                    className="bg-ashram-background bg-opacity-50 backdrop-blur-sm rounded-2xl border border-ashram-saffron p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-2xl font-semibold mb-4 text-ashram-saffron malayalam-text">ആത്മാവിന്റെ ഭാവി 🔮</h3>
                    <div className="grid gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-ashram-text-secondary malayalam-text">ആത്മാവിന്റെ നിറം:</span>
                        <span style={{ color: prophecy.atmaavu_color }} className="font-bold malayalam-text">
                          {prophecy.atmaavu_color}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ashram-text-secondary malayalam-text">ഭാഗ്യത്തിന്റെ നൂൽ:</span>
                        <span className="font-bold text-ashram-saffron malayalam-text">{prophecy.bhagyathinte_noolu}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ashram-text-secondary malayalam-text">അടുത്ത ജന്മത്തിലെ മുടി:</span>
                        <span className="font-bold text-ashram-accent malayalam-text">{prophecy.next_life_hair}</span>
                      </div>
                      <div className="mt-4 p-3 bg-ashram-saffron bg-opacity-20 rounded-lg border border-ashram-saffron">
                        <span className="text-ashram-saffron font-semibold malayalam-text">💡 ടിപ്പ്:</span>
                        <span className="text-ashram-text-primary ml-2 malayalam-text">{prophecy.malayalam_tip}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Heatmap Display */}
                {analysis?.heatmaps && analysis.heatmaps.length > 0 && (
                  <motion.div 
                    className="bg-ashram-background bg-opacity-50 backdrop-blur-sm rounded-2xl border border-ashram-accent p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h3 className="text-2xl font-semibold mb-4 text-ashram-accent malayalam-text">ഹീറ്റ്മാപ്പ് 📊</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {analysis.heatmaps.map((heatmap: string, index: number) => (
                        <div key={index} className="text-center">
                          <img 
                            src={heatmap} 
                            alt={`Heatmap ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-ashram-accent"
                          />
                          <p className="text-sm text-ashram-text-secondary mt-2 malayalam-text">
                            {['Front', 'Back', 'Left', 'Right'][index]} View
                          </p>
                        </div>
                      ))}
                    </div>
                    {/* AI Prophecy Generator Button and Card */}
                    <ProphecyGenerator hairScanResult={analysis} />
                  </motion.div>
                )}

                {/* Hair Counter */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <HairCounter />
                </motion.div>

                <motion.button 
                  onClick={reset} 
                  className="w-full bg-ashram-accent hover:bg-opacity-80 text-ashram-background px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  വീണ്ടും ചെയ്യൂ 🔄
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
