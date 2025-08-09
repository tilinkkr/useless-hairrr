"use client";

type Lang = "en" | "ml";

const STORAGE_KEY = "lang";

export const getLang = (): Lang => {
  // Default SSR to Malayalam to match <html lang="ml"> and avoid hydration mismatch
  if (typeof window === "undefined") return "ml";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
  return stored === "ml" ? "ml" : stored === "en" ? "en" : "ml";
};

export const setLang = (lang: Lang) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, lang);
};

export const toggleLang = () => {
  const next = getLang() === "en" ? "ml" : "en";
  setLang(next);
};

// Poetic translations
const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Global
    switch_to_ml: "🌐 Switch to മലയാളം",
    switch_to_en: "🌐 Switch to English",

    // Welcome
    welcome_title: "Mudi Jyotsan",
    welcome_subtitle: "Every strand upon your crown whispers a tale. We listen.",
    welcome_cta: "Seek the Future 🔮",

    // Quiz
    quiz_title: "Question: How many hairs grace your head? 🤔",
    quiz_desc: "Our AI guru shall reveal what no earthly sage can 😎",
    quiz_cta: "Upload Photos 📸",

    // Uploader
    uploader_title: "360° Volumetric Scan 📊",
    uploader_desc: "Capture every angle of your head and upload. Our AI guru shall divine the truth 🧠",
    slot_front: "Front",
    slot_back: "Back",
    slot_left: "Left",
    slot_right: "Right",
    click_here: "Click",
    process_cta_ready: "Proclaim My Fate 🔮",
    process_cta_wait: "Upload all 4 photos 📸",
    must_upload_all: "All 4 photos are required! 📱",
    processing_title: "Analyzing...",
    processing_1: "Scanning the soul... 🧘‍♂️",
    processing_2: "Counting the hairs... 🔢",
    processing_3: "Awaiting guru's counsel... 🧙‍♂️",
    processing_4: "Consulting the stars... 🔮",
    processing_5: "Baldness detection engaged... 😂",
    processing_6: "Forging heatmaps... 📊",
    processing_7: "Preparing revelations... ⚡",

    // Results
    results_title: "Results 🎯",
    hair_analysis_title: "Hair Analysis 🔬",
    analysis_time_label: "Analysis Time",
    guru_count_label: "Guru's Count",
    confidence_label: "Confidence",
    heatmap_title: "Heatmaps 📊",
    reset_btn: "Begin Again 🔄",

    // Prophecy card labels
    prophecy_title: "Prophecy of the Soul 🔮",
    soul_color: "Hue of the Soul:",
    thread_of_fate: "Thread of Fortune:",
    next_life_hair: "Hair of the Next Birth:",
    tip_label: "Insight:",

    // HairCounter
    live_feed: "Live Satellite Feed 📡",
    calculating: "Calculating...",
    bald_label: "Bald! 😅",
    disclaimer: "Accuracy not guaranteed. Do not inquire of numbers. 🤪",
  },
  ml: {
    // Global
    switch_to_ml: "🌐 മലയാളത്തിലേക്ക് മാറ്റുക",
    switch_to_en: "🌐 Switch to English",

    // Welcome
    welcome_title: "മുടി ജ്യോത്സൻ",
    welcome_subtitle: "കിരീടത്തിൽ വീണ ഓരോ ഇഴയും കഥ പറയുന്നു; ഞങ്ങൾ സാവധാനം കേൾക്കുന്നു.",
    welcome_cta: "ഭാവി അന്വേഷിക്കൂ 🔮",

    // Quiz
    quiz_title: "ചോദ്യം: നിങ്ങളുടെ തലയിൽ എത്ര ഇഴകൾ? 🤔",
    quiz_desc: "മരണദേശത്തിലെ യാതൊരു ഗുരുവിനും പറയാനാവാത്തത് ഞങ്ങളുടെ AI ഗുരു പറയും 😎",
    quiz_cta: "ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യൂ 📸",

    // Uploader
    uploader_title: "360° വോള്യൂമെട്രിക് സ്കാൻ 📊",
    uploader_desc: "തലയുടെ എല്ലാ കോണുകളും പകർത്തി അപ്‌ലോഡ് ചെയ്യൂ; ഗുരു തത്ത്വം കണ്ടെത്തും 🧠",
    slot_front: "മുൻഭാഗം (Front)",
    slot_back: "പിന്നിൽ (Back)",
    slot_left: "ഇടത് (Left)",
    slot_right: "വലത് (Right)",
    click_here: "ക്ലിക്ക് ചെയ്യൂ",
    process_cta_ready: "എന്റെ ഭാവി പറയൂ 🔮",
    process_cta_wait: "എല്ലാ ഫോട്ടോകളും അപ്‌ലോഡ് ചെയ്യൂ 📸",
    must_upload_all: "എല്ലാ 4 ഫോട്ടോകളും ആവശ്യമാണ്! 📱",
    processing_title: "വിശകലനം ചെയ്യുന്നു...",
    processing_1: "ആത്മാവിനെ സ്കാൻ ചെയ്യുന്നു... 🧘‍♂️",
    processing_2: "ഇഴകൾ എണ്ണുന്നു... 🔢",
    processing_3: "ഗുരുവിന്റെ ഉപദേശം കാത്തിരിക്കുന്നു... 🧙‍♂️",
    processing_4: "നക്ഷത്രഗണിതം പരിശോധിക്കുന്നു... 🔮",
    processing_5: "ബാൾഡ് നിരീക്ഷണം... 😂",
    processing_6: "ഹീറ്റ്മാപ്പുകൾ തീർക്കുന്നു... 📊",
    processing_7: "വചനങ്ങൾ തയ്യാറാക്കുന്നു... ⚡",

    // Results
    results_title: "ഫലം 🎯",
    hair_analysis_title: "മുടി വിശകലനം 🔬",
    analysis_time_label: "വിശകലന സമയം",
    guru_count_label: "ഗുരുവിന്റെ കണക്ക്",
    confidence_label: "വിശ്വാസ്യത",
    heatmap_title: "ഹീറ്റ്മാപ്പുകൾ 📊",
    reset_btn: "വീണ്ടും തുടങ്ങൂ 🔄",

    // Prophecy card labels
    prophecy_title: "ആത്മ പ്രവചനം 🔮",
    soul_color: "ആത്മന്റെ നിറം:",
    thread_of_fate: "ഭാഗ്യനൂൽ:",
    next_life_hair: "അടുത്ത ജന്മത്തിലെ മുടി:",
    tip_label: "സൂചന:",

    // HairCounter
    live_feed: "ലൈവ് സാറ്റലൈറ്റ് ഫീഡ് 📡",
    calculating: "കണക്കാക്കുന്നു...",
    bald_label: "ബാൾഡ്! 😅",
    disclaimer: "കൃത്യത ഉറപ്പില്ല; സംഖ്യ ചോദിക്കരുത്. 🤪",
  },
};

export const t = (key: string): string => {
  const lang = getLang();
  const dict = translations[lang] || translations.en;
  return (dict && dict[key]) || translations.en[key] || key;
};


