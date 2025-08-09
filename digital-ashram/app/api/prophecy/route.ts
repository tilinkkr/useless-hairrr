import { NextResponse } from "next/server";

export async function POST() {
  const hex = () => `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
  const hairs = ["സ്ട്രെയിറ്റ്", "വേവി", "കർളി", "കോയ്ലി", "അദൃശ്യ മുടി"];
  const tips = [
    "വെള്ളം കുടിച്ചാൽ മുടി ഭാവി അറിയിക്കും!",
    "ഇന്നത്തെ കാറ്റ് വടക്കുനിന്നാൽ ഭാഗ്യം ഇരട്ടിക്കും.",
    "ചിരിക്കുക – ഫോളിക്കിൾസ് അത് ഇഷ്ടപ്പെടും.",
    "ചിലപ്പോൾ ഒന്നും ചെയ്യാതിരിക്കുന്നതും ഏറ്റവും ശാസ്ത്രീയമാണ്.",
  ];

  const prophecy = {
    atmaavu_color: hex(),
    bhagyathinte_noolu: Math.floor(Math.random() * 1000000),
    next_life_hair: hairs[Math.floor(Math.random() * hairs.length)],
    malayalam_tip: tips[Math.floor(Math.random() * tips.length)],
  };

  return NextResponse.json(prophecy);
}


