"use client";

import React from "react";
import { getLang } from "../utils/i18n";
import { motion } from "framer-motion";

type Props = {
  hairScanResult: any;
};

export default function ProphecyGenerator({ hairScanResult }: Props) {
  const [username, setUsername] = React.useState("");
  const [birthdate, setBirthdate] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [prophecy, setProphecy] = React.useState<string | null>(null);

  const cacheKey = React.useMemo(() => (username ? `divineProphecy_${username}` : null), [username]);

  // Load cached if exists
  React.useEffect(() => {
    if (!cacheKey) return;
    try {
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) setProphecy(cached);
    } catch {}
  }, [cacheKey]);

  function seededRandom(seed: string) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    return () => {
      h = Math.imul(48271, h) % 0x7fffffff;
      return (h & 0x7fffffff) / 0x7fffffff;
    };
  }

  function generateProphecy(name: string, dob: string, result: any, lang: "en" | "ml") {
    const seed = `${name}|${dob}|${JSON.stringify(result?.count ?? 0)}`;
    const rnd = seededRandom(seed);
    const pick = (arr: string[]) => arr[Math.floor(rnd() * arr.length) % arr.length];

    const cosmos = lang === "ml"
      ? ["പ്രപഞ്ചം", "ആകാശഗംഗ", "നക്ഷത്രതന്തു", "കാളിന്ദി പ്രബാഹം", "ചന്ദന വാതായനം"]
      : ["cosmos", "galaxy", "starlight", "quantum river", "lunar window"];
    const tech = lang === "ml"
      ? ["ആത്മിക ട്രാൻസിസ്റ്റർ", "ദിവ്യ ഓസിലേറ്റർ", "പ്രാണ കപ്പാസിറ്റർ", "മന്ത്രിക പെൻഡുലം", "രഹസ്യ സ്പക്ട്രോമീറ്റർ"]
      : ["spiritual transistor", "divine oscillator", "prana capacitor", "mantric pendulum", "secret spectrometer"];
    const verbs = lang === "ml"
      ? ["പുലകിക്കുന്നു", "ചിരിക്കുന്നു", "നിന്നിൽ വഴുതുന്നു", "ശബ്ദിക്കുന്നു", "ഉണരുന്നു"]
      : ["vibrates", "laughs", "flows through", "resounds", "awakens"];
    const blessings = lang === "ml"
      ? ["ശാന്തി", "പ്രഭ", "വിശുദ്ധി", "സ്മൃതി", "ധൈര്യം"]
      : ["serenity", "radiance", "purity", "memory", "courage"];

    const count = Number(result?.count || 0);
    const omen = count > 100000 ? (lang === "ml" ? "മുടിതന്തുക്കളുടെ ഹാർപ്പ്" : "a harp of many hairs") : (lang === "ml" ? "പ്രാണത്തന്ത്രിയുടെ നാദം" : "a hum of pranic strings");

    if (lang === "ml") {
      return [
        `${name || "അജ്ഞാത"} എന്ന പേരിന്റെ ജ്യോതിസ്വരം ${pick(cosmos)}യിൽ തിളങ്ങുന്നു. ${pick(tech)} നിങ്ങളുടെ നാഡികളുടെ അരികിൽ ${pick(verbs)}; ${omen} ഇന്നിരവിലെ ആകാശത്തെ ചെവിതൊട്ടു.`,
        `ജനനദിനം ${dob || "അജ്ഞാത"} — ഈ തീയതി പ്രാണവായുവിന്റെ ഗിയറുകളിൽ പതിഞ്ഞിരിക്കുന്നു. ഓരോ ഇഴയും ഒരു സൂക്ഷ്മ ആന്റെന്ന; ദൂരെ ക്വാണ്ടം മുനമ്പുകളിൽ നിന്ന് ${pick(blessings)} നിങ്ങളുടെ ശിരസിലേക്ക് ഒഴുകുന്നു.`,
        `മുടിവ്യാപ്തിയുടെ ഈ കുറിപ്പ് പ്രഹേളികമായ ദൈവിക-ശാസ്ത്രത്തിന്റെ ചിരിയാണ്. നീ ഇരുന്നാൽ ഭൂമി ശ്വാസം എടുക്കുന്നു; നീ ചിരിക്കുന്നാൽ ${pick(cosmos)} കണ്ണടയ്ക്കുന്നു. മുന്നോട്ട് നീങ്ങുക — നിന്റെ ഹൃദയത്തിൽ പ്രണവം വളഞ്ഞൊഴുകട്ടെ.`
      ].join("\n\n");
    }

    return [
      `The name ${name || "Unknown"} rings like silver in the ${pick(cosmos)}. A ${pick(tech)} ${pick(verbs)} along your neural cloisters; ${omen} hums beneath tonight's indifferent constellations.`,
      `Born on ${dob || "an undisclosed dawn"}, your every strand is a microscopic antenna catching ${pick(blessings)} from distant quantum piers. The scalp, a quiet observatory; the mind, a cathedral of ridiculous wonder.`,
      `This tally of hair is the laughter of absurd science. When you sit, the Earth breathes; when you smile, the ${pick(cosmos)} blinks. Walk onward — let the syllable of OM spiral through your chest like comet-fire.`
    ].join("\n\n");
  }

  async function handleReveal() {
    setError(null);
    setLoading(true);
    try {
      const lang = getLang() === "ml" ? "ml" : "en";
      // Simulate mystical delay
      await new Promise((r) => setTimeout(r, 800 + Math.floor(Math.random() * 1200)));
      const text = generateProphecy(username, birthdate, hairScanResult, lang);
      setProphecy(text);
      if (cacheKey) window.localStorage.setItem(cacheKey, text);
    } catch (e: any) {
      setError("The cosmos is silent. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder={getLang() === "ml" ? "ഉപയോക്തൃനാമം" : "Username"}
          className="bg-ashram-background border border-ashram-accent text-ashram-text-primary rounded px-3 py-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="date"
          className="bg-ashram-background border border-ashram-accent text-ashram-text-primary rounded px-3 py-2"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
        />
        <button
          onClick={handleReveal}
          disabled={loading || !username || !birthdate}
          className="bg-ashram-accent hover:bg-opacity-80 text-ashram-background rounded px-3 py-2 font-semibold disabled:opacity-50"
        >
          {loading ? (getLang() === "ml" ? "പ്രപഞ്ചം തുറക്കുന്നു..." : "Revealing...") : (getLang() === "ml" ? "ദിവ്യ വിശകലനം തുറക്കൂ" : "Reveal Divine Analysis")}
        </button>
      </div>

      {error && (
        <p className="text-ashram-error text-sm">{error}</p>
      )}

      {prophecy && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-xl p-5 bg-gradient-to-br from-ashram-background/80 to-transparent border-2"
          style={{
            borderImage: "linear-gradient(45deg, #00BCD4, #FFC300) 1",
            boxShadow: "0 0 24px rgba(0,188,212,0.2), inset 0 0 24px rgba(255,195,0,0.15)",
          }}
        >
          <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
            background: "radial-gradient(1200px 200px at 10% 10%, rgba(0,188,212,0.07), transparent), radial-gradient(800px 200px at 90% 90%, rgba(255,195,0,0.07), transparent)"
          }} />
          <pre className="whitespace-pre-wrap font-sans text-ashram-text-primary text-sm leading-7 relative z-10">{prophecy}</pre>
        </motion.div>
      )}
    </div>
  );
}


